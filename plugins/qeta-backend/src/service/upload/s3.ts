import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Config } from '@backstage/config';
import { QetaStore } from '../../database/QetaStore';
import { Attachment } from '@drodil/backstage-plugin-qeta-common';
import { File } from '../types';
import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  GetObjectCommand,
  GetObjectCommandOutput,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getS3Client } from '../util';
import {
  AttachmentStorageEngine,
  AttachmentStorageEngineOptions,
  FileOptions,
} from './attachmentStorageEngine';

class S3StoreEngine implements AttachmentStorageEngine {
  config: Config;
  database: QetaStore;
  backendBaseUrl: string;
  qetaUrl: string;
  folder: string;

  bucket?: string;

  constructor(opts: AttachmentStorageEngineOptions) {
    this.config = opts.config;
    this.database = opts.database;
    this.backendBaseUrl = this.config.getString('backend.baseUrl');
    this.qetaUrl = `${this.backendBaseUrl}/api/qeta/attachments`;
    this.bucket = this.config.getOptionalString('qeta.storage.bucket');
    this.folder =
      this.config.getOptionalString('qeta.storage.folder') ||
      '/backstage-qeta-images';
  }

  handleFile = async (
    file: File,
    options?: FileOptions,
  ): Promise<Attachment> => {
    if (!this.bucket) {
      throw new Error('Bucket name is required for S3 storage');
    }
    const imageUuid = uuidv4();
    const filename = `image-${imageUuid}-${Date.now()}.${file.ext}`;
    const newPath = `${this.folder}/${filename}`;
    const imageURI = `${this.qetaUrl}/${imageUuid}`;
    const client = getS3Client(this.config);
    const uploadArgs = {
      Bucket: this.bucket,
      Key: newPath,
      Body: fs.createReadStream(file.path),
    };

    await client.send(new PutObjectCommand(uploadArgs));

    return await this.database.postAttachment({
      uuid: imageUuid,
      locationType: 's3',
      locationUri: imageURI,
      extension: file.ext,
      mimeType: file.mimeType,
      path: newPath,
      binaryImage: undefined,
      ...options,
    });
  };

  getAttachmentBuffer = async (attachment: Attachment) => {
    const bucket = this.config.getOptionalString('qeta.storage.bucket');
    if (!bucket) {
      throw new Error('Bucket name is required for S3 storage');
    }

    const s3 = getS3Client(this.config);
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

  deleteAttachment = async (attachment: Attachment) => {
    const bucket = this.config.getOptionalString('qeta.storage.bucket');
    if (!bucket) {
      throw new Error('Bucket name is required for S3 storage');
    }
    const s3 = getS3Client(this.config);
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
}

export default (opts: AttachmentStorageEngineOptions) => {
  return new S3StoreEngine(opts);
};
