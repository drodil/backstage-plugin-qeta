import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Config } from '@backstage/config';
import { QetaStore } from '../../database/QetaStore';
import { Attachment } from '@drodil/backstage-plugin-qeta-common';
import { File } from '../types';
import { S3 } from 'aws-sdk';

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

  bucket: string;
  accessKeyID: string;
  secretAccessKey: string;


  constructor(opts: Options) {
    this.config = opts.config;
    this.database = opts.database;
    this.backendBaseUrl = this.config.getString('backend.baseUrl');
    this.qetaUrl = `${this.backendBaseUrl}/api/qeta/attachments`;
    this.bucket = this.config.getString('qeta.storage.bucket');
    this.accessKeyID = this.config.getString('qeta.storage.accessKeyID');
    this.secretAccessKey = this.config.getString('qeta.storage.secretAccessKey');
    this.folder =
      this.config.getOptionalString('qeta.storage.folder') ||
      '/backstage-qeta-images';
  }

  newClient = (): S3 => {
    return new S3({
      accessKeyId: this.accessKeyID,
      secretAccessKey: this.secretAccessKey,
    });
  }

  handleFile = async (file: File): Promise<Attachment> => {
    const imageUuid = uuidv4();
    const filename = `image-${imageUuid}-${Date.now()}.${file.ext}`;
    const newPath = `${this.folder}/${filename}`;
    const imageURI = `${this.qetaUrl}/${imageUuid}`;
    const client = this.newClient();
    const uploadArgs = {
      Bucket: this.bucket,
      Key: newPath,
      Body: fs.createReadStream(file.path),
    }

    await client.upload(uploadArgs).promise();

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
