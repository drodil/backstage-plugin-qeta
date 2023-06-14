import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Config } from '@backstage/config';
import { Attachment, QetaStore } from '../../database/QetaStore';
import { File } from '../types';

type Options = {
  config: Config;
  database: QetaStore;
};

class FilesystemStoreEngine {
  config: Config;
  database: QetaStore;
  backendBaseUrl: string;
  qetaUrl: string;
  folder: string;

  constructor(opts: Options) {
    this.config = opts.config;
    this.database = opts.database;
    this.backendBaseUrl = this.config.getString('backend.baseUrl');
    this.qetaUrl = `${this.backendBaseUrl}/api/qeta/attachments`;
    this.folder =
      this.config.getOptionalString('qeta.storage.folder') ||
      '/tmp/backstage-qeta-images';
  }

  handleFile = async (file: File): Promise<Attachment> => {
    fs.mkdirSync(this.folder, { recursive: true });

    const imageUuid = uuidv4();
    const filename = `image-${imageUuid}-${Date.now()}.${file.ext}`;
    const imageURI = `${this.qetaUrl}/${imageUuid}`;

    const newPath = `${this.folder}/${filename}`;

    fs.rename(file.path, newPath, err => {
      if (err) throw err;
      console.debug(`Successfully rename ${file.path} to ${newPath}`);
    });

    const attachment = await this.database.postAttachment({
      uuid: imageUuid,
      locationType: 'filesystem',
      locationUri: imageURI,
      extension: file.ext,
      path: newPath,
      mimeType: file.mimeType,
    });

    return attachment;
  };
}

export default (opts: Options) => {
  return new FilesystemStoreEngine(opts);
};
