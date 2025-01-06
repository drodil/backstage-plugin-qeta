import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Config } from '@backstage/config';
import { QetaStore } from '../../database/QetaStore';
import { Attachment } from '@drodil/backstage-plugin-qeta-common';
import { File } from '../types';
import { AttachmentStorageEngine, AttachmentStorageEngineOptions } from './attachmentStorageEngine';

class FilesystemStoreEngine implements AttachmentStorageEngine {
  config: Config;
  database: QetaStore;
  backendBaseUrl: string;
  qetaUrl: string;
  folder: string;

  constructor(opts: AttachmentStorageEngineOptions) {
    this.config = opts.config;
    this.database = opts.database;
    this.backendBaseUrl = this.config.getString('backend.baseUrl');
    this.qetaUrl = `${this.backendBaseUrl}/api/qeta/attachments`;
    this.folder =
      this.config.getOptionalString('qeta.storage.folder') ||
      '/tmp/backstage-qeta-images';
  }

  handleFile = async (
    file: File,
    options?: { postId?: number; answerId?: number; collectionId?: number },
  ): Promise<Attachment> => {
    fs.mkdirSync(this.folder, { recursive: true });

    const imageUuid = uuidv4();
    const filename = `image-${imageUuid}-${Date.now()}.${file.ext}`;
    const imageURI = `${this.qetaUrl}/${imageUuid}`;

    const newPath = `${this.folder}/${filename}`;

    fs.rename(file.path, newPath, err => {
      if (err) throw err;
      console.debug(`Successfully rename ${file.path} to ${newPath}`);
    });

    return await this.database.postAttachment({
      uuid: imageUuid,
      locationType: 'filesystem',
      locationUri: imageURI,
      extension: file.ext,
      path: newPath,
      mimeType: file.mimeType,
      ...options,
    });
  };

  getAttachmentBuffer = async (attachment: Attachment) => {
    return await fs.promises.readFile(attachment.path);
  };

  deleteAttachment = async (attachment: Attachment) => {
    await fs.promises.rm(attachment.path);
  }
}

export default (opts: AttachmentStorageEngineOptions) => {
  return new FilesystemStoreEngine(opts);
};
