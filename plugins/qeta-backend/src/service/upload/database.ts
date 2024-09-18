import { Config } from '@backstage/config';
import { QetaStore } from '../../database/QetaStore';
import { File } from '../types';
import { v4 as uuidv4 } from 'uuid';

type Options = {
  config: Config;
  database: QetaStore;
};

class DatabaseStoreEngine {
  config: Config;
  database: QetaStore;
  backendBaseUrl: string;
  qetaUrl: string;

  constructor(opts: Options) {
    this.config = opts.config;
    this.database = opts.database;
    this.backendBaseUrl = this.config.getString('backend.baseUrl');
    this.qetaUrl = `${this.backendBaseUrl}/api/qeta/attachments`;
  }

  handleFile = async (file: File) => {
    const imageUuid = uuidv4();
    const locationUri = `${this.qetaUrl}/${imageUuid}`;

    return await this.database.postAttachment({
      uuid: imageUuid,
      locationType: 'database',
      locationUri: locationUri,
      extension: file.ext,
      mimeType: file.mimeType,
      binaryImage: file.buffer,
    });
  };
}

export default (opts: Options) => {
  return new DatabaseStoreEngine(opts);
};
