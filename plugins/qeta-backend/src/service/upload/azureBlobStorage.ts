import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Config } from '@backstage/config';
import { QetaStore } from '../../database/QetaStore';
import { Attachment } from '@drodil/backstage-plugin-qeta-common';
import { File } from '../types';
import { getAzureBlobServiceClient } from '../util';
import {
  AttachmentStorageEngine,
  AttachmentStorageEngineOptions,
  FileOptions,
} from './attachmentStorageEngine';

class AzureBlobStorageEngine implements AttachmentStorageEngine {
  config: Config;
  database: QetaStore;
  qetaUrl: string;
  container: string;

  constructor(opts: AttachmentStorageEngineOptions) {
    this.config = opts.config;
    this.database = opts.database;
    const useRelativeUrls =
      this.config.getOptionalBoolean('qeta.storage.useRelativeUrls') ?? true;
    if (useRelativeUrls) {
      this.qetaUrl = `/api/qeta/attachments`;
    } else {
      const backendBaseUrl = this.config.getString('backend.baseUrl');
      this.qetaUrl = `${backendBaseUrl}/api/qeta/attachments`;
    }
    this.container =
      this.config.getOptionalString('qeta.storage.blobStorageContainer') ||
      'backstage-qeta-images';
  }

  handleFile = async (
    file: File,
    options?: FileOptions,
  ): Promise<Attachment> => {
    const imageUuid = uuidv4();
    const filename = `image-${imageUuid}-${Date.now()}.${file.ext}`;

    const imageURI = `${this.qetaUrl}/${imageUuid}`;
    const client = getAzureBlobServiceClient(this.config);
    const container = client.getContainerClient(this.container);
    if (!(await container.exists())) {
      await container.create();
    }

    await container.uploadBlockBlob(
      filename,
      fs.createReadStream(file.path),
      file.size,
    );

    return await this.database.postAttachment({
      uuid: imageUuid,
      locationType: 'azure',
      locationUri: imageURI,
      extension: file.ext,
      mimeType: file.mimeType,
      path: filename,
      binaryImage: undefined,
      ...options,
    });
  };

  getAttachmentBuffer = async (attachment: Attachment) => {
    const client = getAzureBlobServiceClient(this.config);
    const container = client.getContainerClient(this.container);

    if (!(await container.exists())) {
      return undefined;
    }

    const blob = container.getBlockBlobClient(attachment.path);
    if (await blob.exists()) {
      return blob.downloadToBuffer();
    }

    return undefined;
  };

  deleteAttachment = async (attachment: Attachment) => {
    const client = getAzureBlobServiceClient(this.config);
    const container = client.getContainerClient(this.container);
    if (!(await container.exists())) {
      return;
    }

    const blob = container.getBlockBlobClient(attachment.path);
    if (await blob.exists()) {
      await blob.delete();
    }
  };
}

export default (opts: AttachmentStorageEngineOptions) => {
  return new AzureBlobStorageEngine(opts);
};
