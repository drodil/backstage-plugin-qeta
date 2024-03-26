import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Config } from '@backstage/config';
import { QetaStore } from '../../database/QetaStore';
import { Attachment } from '@drodil/backstage-plugin-qeta-common';
import { File } from '../types';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

type Options = {
  config: Config;
  database: QetaStore;
};

class S3StoreEngine {
  config: Config;
  database: QetaStore;
  backendBaseUrl: string;
  qetaUrl: string;
  folder: string;

  bucket?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;

  constructor(opts: Options) {
    this.config = opts.config;
    this.database = opts.database;
    this.backendBaseUrl = this.config.getString('backend.baseUrl');
    this.qetaUrl = `${this.backendBaseUrl}/api/qeta/attachments`;
    this.bucket = this.config.getOptionalString('qeta.storage.bucket');
    this.accessKeyId = this.config.getOptionalString(
      'qeta.storage.accessKeyId',
    );
    this.secretAccessKey = this.config.getOptionalString(
      'qeta.storage.secretAccessKey',
    );
    this.folder =
      this.config.getOptionalString('qeta.storage.folder') ||
      '/backstage-qeta-images';
    this.region = this.config.getOptionalString('qeta.storage.region');
  }

  newClient = (): S3Client => {
    if (this.accessKeyId && this.secretAccessKey && this.region) {
      return new S3Client({
        credentials: {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey,
        },
        region: this.region,
      });
    }
    return new S3Client({});
  };

  handleFile = async (file: File): Promise<Attachment> => {
    if (!this.bucket) {
      throw new Error('Bucket name is required for S3 storage');
    }
    const imageUuid = uuidv4();
    const filename = `image-${imageUuid}-${Date.now()}.${file.ext}`;
    const newPath = `${this.folder}/${filename}`;
    const imageURI = `${this.qetaUrl}/${imageUuid}`;
    const client = this.newClient();
    const uploadArgs = {
      Bucket: this.bucket,
      Key: newPath,
      Body: fs.createReadStream(file.path),
    };

    await client.send(new PutObjectCommand(uploadArgs));

    const attachment = await this.database.postAttachment({
      uuid: imageUuid,
      locationType: 's3',
      locationUri: imageURI,
      extension: file.ext,
      mimeType: file.mimeType,
      path: newPath,
      binaryImage: Buffer.from('0'),
      creator: '', // required to run locally on sqlite, otherwise it complains about null.
    });

    return attachment;
  };
}

export default (opts: Options) => {
  return new S3StoreEngine(opts);
};
