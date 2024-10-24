import { Router } from 'express';
import { Attachment } from '@drodil/backstage-plugin-qeta-common';
import multiparty from 'multiparty';
import FilesystemStoreEngine from '../upload/filesystem';
import DatabaseStoreEngine from '../upload/database';
import S3StoreEngine from '../upload/s3';
import fs from 'fs';
import FileType from 'file-type';
import { File, RouteOptions } from '../types';
import { GetObjectCommand, GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { getS3Client } from '../util';
import sharp from 'sharp';

const DEFAULT_IMAGE_SIZE_LIMIT = 2500000;
const DEFAULT_MIME_TYPES = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
];

const resizeImage = (buffer: Buffer, width?: number, height?: number) => {
  return sharp(buffer).resize(width, height).toBuffer();
};

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
    const fileSystemEngine = FilesystemStoreEngine(options);
    const databaseEngine = DatabaseStoreEngine(options);
    const s3Engine = S3StoreEngine(options);

    form.parse(request, async (err, _fields, files) => {
      if (err) {
        response.status(500).json({ errors: [{ message: err.message }] });
        return;
      }

      const fileRequest = files.image[0];
      let fileBuffer = await fs.promises.readFile(`${fileRequest?.path}`);
      const mimeType = await FileType.fromBuffer(fileBuffer);

      if (mimeType && !supportedFilesTypes.includes(mimeType.mime)) {
        response.status(400).json({
          errors: [
            { message: `Attachment type (${mimeType.mime}) not supported.` },
          ],
        });
        return;
      }

      if (request.query.width || request.query.height) {
        const width = request.query.width
          ? parseInt(request.query.width as string, 10)
          : undefined;
        const height = request.query.height
          ? parseInt(request.query.height as string, 10)
          : undefined;
        if ((width && isNaN(width)) || (height && isNaN(height))) {
          response.status(400).json({
            errors: [{ message: `Width and height must be integers.` }],
          });
          return;
        }
        fileBuffer = await resizeImage(fileBuffer, width, height);
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

      switch (storageType) {
        case 's3':
          attachment = await s3Engine.handleFile(file);
          break;
        case 'filesystem':
          attachment = await fileSystemEngine.handleFile(file);
          break;
        case 'database':
        default:
          attachment = await databaseEngine.handleFile(file);
          break;
      }
      response.json(attachment);
    });
  });

  // GET /attachments/:id
  router.get('/attachments/:uuid', async (request, response) => {
    const { uuid } = request.params;

    const attachment = await database.getAttachment(uuid);
    if (!attachment) {
      return response.status(404).send('Attachment not found');
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
    });

    return response.end(imageBuffer);
  });
};
