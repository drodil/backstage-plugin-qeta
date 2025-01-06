import { Router } from 'express';
import { Attachment } from '@drodil/backstage-plugin-qeta-common';
import multiparty from 'multiparty';
import FilesystemStoreEngine from '../upload/filesystem';
import DatabaseStoreEngine from '../upload/database';
import S3StoreEngine from '../upload/s3';
import AzureBlobStorageEngine from '../upload/azureBlobStorage';
import fs from 'fs';
import FileType from 'file-type';
import { File, RouteOptions } from '../types';
import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  GetObjectCommand,
  GetObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { getS3Client } from '../util';
import { AttachmentStorageEngine } from '../upload/attachmentStorageEngine';

const DEFAULT_IMAGE_SIZE_LIMIT = 2500000;
const DEFAULT_MIME_TYPES = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
];

export const attachmentsRoutes = (router: Router, options: RouteOptions) => {
  const { database, config } = options;

  // POST /attachments
  router.post('/attachments', async (request, response) => {
    let attachment: Attachment;

    const storageType =
      config?.getOptionalString('qeta.storage.type') || 'database';
    const maxSizeImage =
      config?.getOptionalNumber('qeta.storage.maxSizeImage') ||
      DEFAULT_IMAGE_SIZE_LIMIT;
    const supportedFilesTypes =
      config?.getOptionalStringArray('qeta.storage.allowedMimeTypes') ||
      DEFAULT_MIME_TYPES;

    const form = new multiparty.Form();

    let engine: AttachmentStorageEngine;
    switch (storageType) {
      case 'azure':
        engine = AzureBlobStorageEngine(options);
        break;
      case 's3':
        engine = S3StoreEngine(options);
        break;
      case 'filesystem':
        engine = FilesystemStoreEngine(options);
        break;
      case 'database':
      default:
        engine = DatabaseStoreEngine(options);
        break;
    }

    form.parse(request, async (err, _fields, files) => {
      if (err) {
        response.status(500).json({ errors: [{ message: err.message }] });
        return;
      }

      const fileRequest = files.image[0];
      const fileBuffer = await fs.promises.readFile(`${fileRequest?.path}`);
      const mimeType = await FileType.fromBuffer(fileBuffer);

      if (mimeType && !supportedFilesTypes.includes(mimeType.mime)) {
        response.status(400).json({
          errors: [
            { message: `Attachment type (${mimeType.mime}) not supported.` },
          ],
        });
        return;
      }

      if (fileBuffer.byteLength > maxSizeImage) {
        response.status(400).json({
          errors: [
            {
              message: `Attachment is larger than ${maxSizeImage} bytes. Try to make it smaller before uploading.`,
            },
          ],
        });
        return;
      }

      const file: File = {
        name: fileRequest.fieldName,
        path: fileRequest.path,
        buffer: fileBuffer,
        mimeType: mimeType?.mime.toString() || '',
        ext: mimeType?.ext.toString() || '',
        size: fileBuffer.byteLength || 0,
      };

      const opts = {
        postId: request.query.postId ? Number(request.query.postId) : undefined,
        answerId: request.query.answerId
          ? Number(request.query.answerId)
          : undefined,
        collectionId: request.query.collectionId
          ? Number(request.query.collectionId)
          : undefined,
      };

      attachment = await engine.handleFile(file, opts);
      response.json(attachment);
    });
  });

  // GET /attachments/:id
  router.get('/attachments/:uuid', async (request, response) => {
    const { uuid } = request.params;

    const attachment = await database.getAttachment(uuid);
    if (!attachment) {
      response.status(404).send('Attachment not found');
      return;
    }

    const getS3ImageBuffer = async () => {
      const bucket = config.getOptionalString('qeta.storage.bucket');
      if (!bucket) {
        throw new Error('Bucket name is required for S3 storage');
      }
      const s3 = getS3Client(config);
      const object: GetObjectCommandOutput = await s3.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: attachment.path,
        }),
      );

      if (!object.Body) {
        return undefined;
      }
      const bytes = await object.Body.transformToByteArray();
      return Buffer.from(bytes);
    };

    let imageBuffer: Buffer | undefined;
    switch (attachment.locationType) {
      case 's3':
        imageBuffer = await getS3ImageBuffer();
        break;
      case 'filesystem':
        imageBuffer = await fs.promises.readFile(attachment.path);
        break;
      default:
      case 'database':
        imageBuffer = attachment.binaryImage;
        break;
    }

    if (!imageBuffer) {
      response.status(500).send('Attachment buffer is undefined');
    }

    response.writeHead(200, {
      'Content-Type': attachment.mimeType,
      'Content-Length': imageBuffer ? imageBuffer.byteLength : '',
      'Cache-Control': 'public, max-age=31536000',
      'Last-Modified': attachment.created.toUTCString(),
    });

    response.end(imageBuffer);
  });

  // DELETE /attachments/:id
  router.delete('/attachments/:uuid', async (request, response) => {
    const { uuid } = request.params;

    // Only allow own service credentials
    const credentials = await options.httpAuth.credentials(request, {
      allow: ['service'],
    });
    if (!credentials || credentials.principal.subject !== 'plugin:qeta') {
      response.status(401).send('Unauthorized');
      return;
    }

    const attachment = await database.getAttachment(uuid);
    if (!attachment) {
      response.status(404).send('Attachment not found');
      return;
    }

    const deleteS3Image = async () => {
      const bucket = config.getOptionalString('qeta.storage.bucket');
      if (!bucket) {
        throw new Error('Bucket name is required for S3 storage');
      }
      const s3 = getS3Client(config);
      const output: DeleteObjectCommandOutput = await s3.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: attachment.path,
        }),
      );
      if (output.$metadata.httpStatusCode !== 204) {
        throw new Error('Failed to delete object');
      }
    };

    switch (attachment.locationType) {
      case 's3':
        await deleteS3Image();
        break;
      case 'filesystem':
        await fs.promises.rm(attachment.path);
        break;
      default:
      case 'database':
        break;
    }

    const result = await database.deleteAttachment(uuid);
    if (!result) {
      response.status(404).send('Attachment not found');
      return;
    }
    response.sendStatus(204);
  });
};
