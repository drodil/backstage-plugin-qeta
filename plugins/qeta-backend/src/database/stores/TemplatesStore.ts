import { Template } from '@drodil/backstage-plugin-qeta-common';
import { Templates } from '../QetaStore';
import { Knex } from 'knex';
import { BaseStore } from './BaseStore';
import { TagsStore } from './TagsStore';
import { EntitiesStore } from './EntitiesStore';

export interface RawTemplate {
  id: number;
  title: string;
  description: string;
  questionTitle: string | null;
  questionContent: string | null;
}

export class TemplatesStore extends BaseStore {
  constructor(
    protected readonly db: Knex,
    private readonly tagsStore: TagsStore,
    private readonly entitiesStore: EntitiesStore,
  ) {
    super(db);
  }

  async getTemplates(): Promise<Templates> {
    const templates = await this.db('templates').select('*');
    return {
      templates: await this.mapTemplateEntities(templates),
      total: templates.length,
    };
  }

  async getTemplate(id: number): Promise<Template | null> {
    const templates = await this.db('templates').where('id', id).select('*');
    if (templates.length === 0) {
      return null;
    }
    return (await this.mapTemplateEntities(templates))[0];
  }

  async createTemplate(options: {
    title: string;
    description: string;
    questionTitle?: string;
    questionContent?: string;
    tags?: string[];
    entities?: string[];
  }): Promise<Template> {
    const {
      title,
      description,
      questionTitle,
      questionContent,
      tags,
      entities,
    } = options;
    const templates = await this.db
      .insert(
        {
          title,
          description,
          questionTitle,
          questionContent,
        },
        ['id'],
      )
      .into('templates')
      .returning('*');

    await Promise.all([
      this.tagsStore.addTags(
        templates[0].id,
        tags,
        false,
        'template_tags',
        'templateId',
      ),
      this.entitiesStore.addEntities(
        templates[0].id,
        entities,
        false,
        'template_entities',
        'templateId',
      ),
    ]);

    return (await this.mapTemplateEntities(templates))[0];
  }

  async deleteTemplate(id: number): Promise<boolean> {
    const rows = await this.db('templates').where('id', id).delete();
    return rows > 0;
  }

  async updateTemplate(options: {
    id: number;
    title: string;
    description: string;
    questionTitle?: string;
    questionContent?: string;
    tags?: string[];
    entities?: string[];
  }): Promise<Template | null> {
    const {
      id,
      title,
      description,
      questionTitle,
      questionContent,
      tags,
      entities,
    } = options;
    const templates = await this.db('templates').where('id', id).update(
      {
        title,
        description,
        questionTitle,
        questionContent,
      },
      ['*'],
    );

    if (templates.length === 0) {
      return null;
    }

    await Promise.all([
      this.tagsStore.addTags(
        templates[0].id,
        tags,
        true,
        'template_tags',
        'templateId',
      ),
      this.entitiesStore.addEntities(
        templates[0].id,
        entities,
        true,
        'template_entities',
        'templateId',
      ),
    ]);

    return (await this.mapTemplateEntities(templates))[0];
  }

  private async mapTemplateEntities(rows: RawTemplate[]): Promise<Template[]> {
    if (rows.length === 0) {
      return [];
    }
    const ids = rows.map(r => r.id);
    const [tags, entities] = await Promise.all([
      this.tagsStore.getRelatedTags(ids, 'template_tags', 'templateId'),
      this.entitiesStore.getRelatedEntities(
        ids,
        'template_entities',
        'templateId',
      ),
    ]);

    return rows.map(val => {
      return {
        id: val.id,
        title: val.title,
        description: val.description,
        questionTitle: val.questionTitle ?? undefined,
        questionContent: val.questionContent ?? undefined,
        tags: tags.get(val.id) || [],
        entities: entities.get(val.id) || [],
      };
    });
  }
}
