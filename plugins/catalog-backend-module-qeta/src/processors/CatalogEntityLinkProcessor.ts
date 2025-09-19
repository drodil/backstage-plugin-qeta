import { CatalogProcessor } from '@backstage/plugin-catalog-node';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  AuthService,
  CacheService,
  DiscoveryService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import {
  EntityLinks,
  QetaApi,
  QetaClient,
} from '@drodil/backstage-plugin-qeta-common';

export class CatalogEntityLinkProcessor implements CatalogProcessor {
  private readonly client: QetaApi;

  constructor(
    private readonly auth: AuthService,
    private readonly cache: CacheService,
    private readonly logger: LoggerService,
    discovery: DiscoveryService,
  ) {
    this.client = new QetaClient({ discoveryApi: discovery });
  }

  getProcessorName(): string {
    return 'CatalogEntityLinkProcessor';
  }

  async postProcessEntity(entity: Entity): Promise<Entity> {
    const entityRef = stringifyEntityRef(entity);
    const entityLinks = await this.getEntityLinks();
    const links = entityLinks
      .filter(link => link.entityRef === entityRef)
      .map(link => link.links)
      .flat();
    if (!links || links.length === 0) {
      return entity;
    }

    const existingLinks = entity.metadata.links ?? [];
    const uniqueLinks = [...existingLinks];
    for (const link of links) {
      if (!existingLinks.find(l => l.url === link.url)) {
        uniqueLinks.push(link);
      }
    }

    this.logger.debug(
      `Adding total of ${uniqueLinks.length}, new ${
        uniqueLinks.length - existingLinks.length
      } links to entity ${entityRef}`,
    );

    return {
      ...entity,
      metadata: {
        ...entity.metadata,
        links: uniqueLinks,
      },
    };
  }

  private async getEntityLinks(): Promise<EntityLinks[]> {
    const cached = await this.cache.get<string>('qeta-entity-links');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        this.logger.warn(`Failed to parse cached entity links: ${e}`);
      }
    }

    this.logger.info(`Fetching entity links from Qeta`);
    const credentials = await this.auth.getOwnServiceCredentials();
    const { token } = await this.auth.getPluginRequestToken({
      onBehalfOf: credentials,
      targetPluginId: 'qeta',
    });
    const links = await this.client.getEntityLinks({ token });
    await this.cache.set('qeta-entity-links', JSON.stringify(links), {
      ttl: 60 * 60, // cache for 1 hour
    });
    return links;
  }
}
