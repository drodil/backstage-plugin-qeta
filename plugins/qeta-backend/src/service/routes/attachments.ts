import { Router } from 'express';
import { RouterOptions } from '../router';
import { Attachment } from '@drodil/backstage-plugin-qeta-common';
import multiparty from 'multiparty';
import FilesystemStoreEngine from '../upload/filesystem';
import DatabaseStoreEngine from '../upload/database';
import S3StoreEngine from '../upload/s3';
import fs from 'fs';
import FileType from 'file-type';
import { File } from '../types';
import { S3 } from 'aws-sdk';

const DEFAULT_IMAGE_SIZE_LIMIT = 2500000;
const DEFAULT_MIME_TYPES = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
];

export const attachmentsRoutes = (router: Router, options: RouterOptions) => {
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
    const fileSystemEngine = FilesystemStoreEngine(options);
    const databaseEngine = DatabaseStoreEngine(options);
    const s3Engine = S3StoreEngine(options);

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

      if (storageType === 'database') {
        attachment = await databaseEngine.handleFile(file);
        response.json(attachment);
      }
      if (storageType === 's3') {
        attachment = await s3Engine.handleFile(file);
        response.json(attachment);
      } else {
        attachment = await fileSystemEngine.handleFile(file);
        response.json(attachment);
      }
    });
  });

  // GET /attachments/:id
  router.get('/attachments/:uuid', async (request, response) => {
    const { uuid } = request.params;

    const attachment = await database.getAttachment(uuid);
    if (!attachment) {
      return response.status(404).send('Attachment not found');
    }

    let imageBuffer: Buffer;
    if (attachment.locationType === 'database') {
      imageBuffer = attachment.binaryImage;
    } else if (attachment.locationType === 's3') {
      const bucket = config.getOptionalString('qeta.storage.bucket');
      const accessKeyId = config.getOptionalString('qeta.storage.accessKeyId');
      const secretAccessKey = config.getOptionalString(
        'qeta.storage.secretAccessKey',
      );
      if (!bucket) {
        throw new Error('Bucket name is required for S3 storage');
      }
      const s3 =
        accessKeyId && secretAccessKey
          ? new S3({
              credentials: {
                accessKeyId,
                secretAccessKey,
              },
            })
          : new S3();
      const object = await s3
        .getObject({
          Bucket: bucket,
          Key: attachment.path,
        })
        .promise();
      imageBuffer = object.Body as Buffer;
    } else {
      imageBuffer = await fs.promises.readFile(attachment.path);
    }

    if (!imageBuffer) {
      response.status(500).send('Attachment buffer is undefined');
    }

    response.writeHead(200, {
      'Content-Type': attachment.mimeType,
      'Content-Length': imageBuffer ? imageBuffer.byteLength : '',
    });

    return response.end(imageBuffer);
  });
};
