import { Injectable, Logger } from '@nestjs/common';
import { InjectMeiliSearch } from 'nestjs-meilisearch';
import { MeiliSearch, Index } from 'meilisearch';

import { EventAction, GenericEvent } from '@contracts/events';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  // @ts-ignore
  constructor(@InjectMeiliSearch() private readonly meiliSearch: MeiliSearch) {}

  async handleEvent<T = any>(event: GenericEvent<T>) {
    if (!this.isIndexable(event)) {
      return;
    }

    const { entity, entityId, action, after } = event;
    const isRemove = action === EventAction.DELETE;

    const indexName = entity.toLowerCase().replace(/_/g, '-');
    let index: Index<Record<string, any>> | null = null;

    try {
      index = await this.meiliSearch.getIndex(indexName);
    } catch (error) {
      await this.meiliSearch.createIndex(indexName);
      index = await this.meiliSearch.getIndex(indexName);
    }

    // @ts-ignore
    const originalId = after?.id;
    const id = entityId.replace('/', '_');
    const storedEntry = {
      ...after,
      id,
      originalId,
    };

    try {
      await index.getDocument(entityId);

      this.logger.debug(`Document ${entityId} in ${indexName} found`);

      if (isRemove) {
        this.logger.debug(
          `Document ${entityId} in ${indexName} will be deleted`,
        );

        return index.deleteDocument(entityId);
      }

      this.logger.debug(`Document ${entityId} in ${indexName} will be updated`);

      return index.updateDocuments([storedEntry!]);
    } catch (error) {
      this.logger.debug(error);

      if (isRemove) {
        this.logger.debug(
          `Document ${entityId} in ${indexName} not found - won't delete`,
        );

        return;
      }

      this.logger.debug(
        `Document ${entityId} in ${indexName} not found - adding to index`,
      );

      return index.updateDocuments([storedEntry!]);
    }
  }

  private isIndexable<T = any>(event: GenericEvent<T>): boolean {
    const nonIndexableEntities: string[] = [];

    if (nonIndexableEntities.includes(event.entity)) {
      return false;
    }

    return true;
  }
}
