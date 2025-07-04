import { Config } from '@backstage/config';
import { QetaStore } from '../../database/QetaStore';
import { File } from '../types';
import { v4 as uuidv4 } from 'uuid';
import {
  AttachmentStorageEngine,
  AttachmentStorageEngineOptions,
  FileOptions,
} from './attachmentStorageEngine';
import { Attachment } from '@drodil/backstage-plugin-qeta-common';

class DatabaseStoreEngine implements AttachmentStorageEngine {
  config: Config;
  database: QetaStore;
  qetaUrl: string;

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
  }

  handleFile = async (file: File, options?: FileOptions) => {
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

  deleteAttachment = async (_attachment: Attachment) => {
    // Nothing to do here, since the attachment is stored in the database
  };
}

export default (opts: AttachmentStorageEngineOptions) => {
  return new DatabaseStoreEngine(opts);
};
