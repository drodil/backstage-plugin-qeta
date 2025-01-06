import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Config } from '@backstage/config';
import { QetaStore } from '../../database/QetaStore';
import { Attachment } from '@drodil/backstage-plugin-qeta-common';
import { File } from '../types';
import { getAzureBlobServiceClient } from '../util';
import { AttachmentStorageEngine } from './attachmentStorageEngine';

type Options = {
  config: Config;
  database: QetaStore;
};

class AzureBlobStorageEngine implements AttachmentStorageEngine {
  config: Config;
  database: QetaStore;
  backendBaseUrl: string;
  qetaUrl: string;
  container: string;

  constructor(opts: Options) {
    this.config = opts.config;
    this.database = opts.database;
    this.backendBaseUrl = this.config.getString('backend.baseUrl');
    this.qetaUrl = `${this.backendBaseUrl}/api/qeta/attachments`;
    this.container =
      this.config.getOptionalString('qeta.storage.blobStorageContainer') ||
      'backstage-qeta-images';
  }

  handleFile = async (
    file: File,
    options?: { postId?: number; answerId?: number; collectionId?: number },
  ): Promise<Attachment> => {
    const imageUuid = uuidv4();
    const filename = `image-${imageUuid}-${Date.now()}.${file.ext}`;

    const imageURI = `${this.qetaUrl}/${imageUuid}`;
    const client = getAzureBlobServiceClient(this.config);
    const container = client.getContainerClient(this.container);
    if (!(await container.exists())) {
        await container.create();
    }

    await container.uploadBlockBlob(filename, fs.createReadStream(file.path), file.size);

    return await this.database.postAttachment({
      uuid: imageUuid,
      locationType: 'azure',
      locationUri: imageURI,
      extension: file.ext,
      mimeType: file.mimeType,
      path: filename,
      binaryImage: Buffer.from('0'),
      creator: '', // required to run locally on sqlite, otherwise it complains about null.
      ...options,
    });
  };
}

export default (opts: Options) => {
  return new AzureBlobStorageEngine(opts);
};
