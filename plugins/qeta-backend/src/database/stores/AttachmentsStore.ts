import { Attachment } from '@drodil/backstage-plugin-qeta-common';
import { AttachmentParameters } from '../QetaStore';
import { Knex } from 'knex';
import { BaseStore } from './BaseStore';

export interface RawAttachment {
  id: number;
  created: Date | string | number;
  uuid: string;
  locationType: string;
  locationUri: string;
  extension: string;
  mimeType: string;
  path?: string;
  binaryImage?: Buffer;
  creator?: string;
  postId?: number;
  answerId?: number;
  collectionId?: number;
}

export class AttachmentsStore extends BaseStore {
  constructor(protected readonly db: Knex) {
    super(db);
  }

  async postAttachment({
    uuid,
    locationType,
    locationUri,
    extension,
    mimeType,
    binaryImage,
    path,
    creator,
  }: AttachmentParameters): Promise<Attachment> {
    const attachment = await this.db
      .insert({
        uuid,
        locationType,
        locationUri,
        extension,
        mimeType,
        path,
        binaryImage,
        creator,
        created: new Date(),
      })
      .into('attachments')
      .returning('*');
    return this.mapAttachment(attachment[0]);
  }

  async getAttachment(uuid: string): Promise<Attachment | undefined> {
    const attachment = await this.db('attachments')
      .where('uuid', uuid)
      .select('*')
      .first();
    return attachment ? this.mapAttachment(attachment) : undefined;
  }

  async getAttachments(
    ids: number[],
    type: 'postId' | 'answerId' | 'collectionId',
  ): Promise<Map<number, number[]>> {
    if (ids.length === 0) {
      return new Map();
    }
    const attachments = await this.db('attachments')
      .whereIn(type, ids)
      .select('id', `${type} as entityId`);

    const result = new Map<number, number[]>();
    attachments.forEach((a: any) => {
      const ps = result.get(a.entityId) || [];
      ps.push(a.id);
      result.set(a.entityId, ps);
    });
    return result;
  }

  async deleteAttachment(uuid: string): Promise<boolean> {
    const rows = await this.db('attachments').where('uuid', uuid).delete();
    return rows > 0;
  }

  async getDeletableAttachments(dayLimit: number): Promise<Attachment[]> {
    const date = new Date();
    date.setDate(date.getDate() - dayLimit);
    const attachments = await this.db('attachments')
      .whereNull('postId')
      .whereNull('answerId')
      .whereNull('collectionId')
      .where('created', '<', date)
      .select('*');
    return attachments.map((a: any) => this.mapAttachment(a));
  }

  private mapAttachment(val: RawAttachment): Attachment {
    return {
      ...val,
      path: val.path || '',
      binaryImage: val.binaryImage || Buffer.from(''),
      creator: val.creator || '',
      created:
        val.created instanceof Date ? val.created : new Date(val.created),
    } as Attachment;
  }
}
