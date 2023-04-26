import multer from 'multer';
import fs from 'fs';
import { Config } from '@backstage/config';

const diskStorage = (config: Config) => {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const storageImagesFolderType =
        config.getOptionalString('qeta.storage.folder') ||
        '/tmp/backstage-qeta-images';

      fs.mkdirSync(storageImagesFolderType, { recursive: true });
      cb(null, storageImagesFolderType);
    },
    filename: (_req, _file, cb) => {
      cb(null, `image-${Date.now()}`);
    },
  });
};

export const multerUploaderMiddleware = (
  config: Config,
  attachmentField: string,
) => {
  return multer({
    storage: diskStorage(config),
  }).single(attachmentField);
};
