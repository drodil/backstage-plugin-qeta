import { Attachment } from '@drodil/backstage-plugin-qeta-common';
import { File } from '../types';

export interface AttachmentStorageEngine {
    handleFile: (file: File, options?: { postId?: number; answerId?: number; collectionId?: number }) => Promise<Attachment>;
}