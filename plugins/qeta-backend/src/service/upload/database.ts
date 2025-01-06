import { Config } from '@backstage/config';
import { QetaStore } from '../../database/QetaStore';
import { File } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { AttachmentStorageEngine, AttachmentStorageEngineOptions } from './attachmentStorageEngine';
import { Attachment } from '@drodil/backstage-plugin-qeta-common';

class DatabaseStoreEngine implements AttachmentStorageEngine {
  config: Config;
  database: QetaStore;
  backendBaseUrl: string;
  qetaUrl: string;

  constructor(opts: AttachmentStorageEngineOptions) {
    this.config = opts.config;
    this.database = opts.database;
    this.backendBaseUrl = this.config.getString('backend.baseUrl');
    this.qetaUrl = `${this.backendBaseUrl}/api/qeta/attachments`;
  }

  handleFile = async (
    file: File,
    options?: { postId?: number; answerId?: number; collectionId?: number },
  ) => {
    const imageUuid = uuidv4();
    const locationUri = `${this.qetaUrl}/${imageUuid}`;

    return await this.database.postAttachment({
      uuid: imageUuid,
      locationType: 'database',
      locationUri: locationUri,
      extension: file.ext,
      mimeType: file.mimeType,
      binaryImage: file.buffer,
      ...options,
    });
  };

  getAttachmentBuffer = async (attachment: Attachment) => {
    return attachment.binaryImage;
  };
}

export default (opts: AttachmentStorageEngineOptions) => {
  return new DatabaseStoreEngine(opts);
};
