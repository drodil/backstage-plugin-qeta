import { Attachment } from '@drodil/backstage-plugin-qeta-common';
import { File } from '../types';
import { Config } from '@backstage/config/index';
import { QetaStore } from '../../database/QetaStore';

export type AttachmentStorageEngineOptions = {
  config: Config;
  database: QetaStore;
};

export type FileOptions = {
  creator: string;
  postId?: number;
  answerId?: number;
  collectionId?: number;
};

export interface AttachmentStorageEngine {
  handleFile: (file: File, options?: FileOptions) => Promise<Attachment>;
  getAttachmentBuffer: (attachment: Attachment) => Promise<Buffer | undefined>;
  deleteAttachment(attachment: Attachment): Promise<void>;
}
