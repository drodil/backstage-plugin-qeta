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
  AttachmentStorageEngine,
  AttachmentStorageEngineOptions,
} from '../upload/attachmentStorageEngine';
import { getUsername } from '../util';

const DEFAULT_IMAGE_SIZE_LIMIT = 2500000;
const DEFAULT_MIME_TYPES = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
];

const getStorageEngine = (
  storageType: string,
  options: AttachmentStorageEngineOptions,
): AttachmentStorageEngine => {
  switch (storageType) {
    case 'azure':
      return AzureBlobStorageEngine(options);
    case 's3':
      return S3StoreEngine(options);
    case 'filesystem':
      return FilesystemStoreEngine(options);
    case 'database':
    default:
      return DatabaseStoreEngine(options);
  }
};

export const attachmentsRoutes = (router: Router, options: RouteOptions) => {
  const { database, config } = options;

  // POST /attachments
  router.post('/attachments', async (request, response) => {
    let attachment: Attachment;

    const username = await getUsername(request, options);

    const storageType =
      config?.getOptionalString('qeta.storage.type') || 'database';
    const maxSizeImage =
      config?.getOptionalNumber('qeta.storage.maxSizeImage') ||
      DEFAULT_IMAGE_SIZE_LIMIT;
    const supportedFilesTypes =
      config?.getOptionalStringArray('qeta.storage.allowedMimeTypes') ||
      DEFAULT_MIME_TYPES;

    const form = new multiparty.Form();

    const engine = getStorageEngine(storageType, options);

    form.parse(request, async (err, _fields, files) => {
      if (err) {
        response.status(500).json({ errors: [{ message: err.message }] });
        return;
      }

      const fileRequest = files.image[0];
      const fileBuffer = await fs.promises.readFile(`${fileRequest?.path}`);
      const mimeType = await FileType.fromBuffer(fileBuffer);

      if (!mimeType || !supportedFilesTypes.includes(mimeType.mime)) {
        response.status(400).json({
          errors: [
            {
              message: `Attachment type (${
                mimeType?.mime ?? 'unknown'
              }) not supported.`,
            },
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
        creator: username,
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

    const engine = getStorageEngine(attachment.locationType, options);
    const imageBuffer = await engine.getAttachmentBuffer(attachment);

    if (!imageBuffer) {
      response.status(404).end();
      return;
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

    const engine = getStorageEngine(attachment.locationType, options);
    await engine.deleteAttachment(attachment);

    const result = await database.deleteAttachment(uuid);
    if (!result) {
      response.status(404).send('Attachment not found');
      return;
    }
    response.sendStatus(204);
  });
};
