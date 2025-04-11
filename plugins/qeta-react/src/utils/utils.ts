import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { Filters } from '../components/FilterPanel/FilterPanel';
import FileType from 'file-type';
import { ErrorApi } from '@backstage/core-plugin-api';
import { QetaApi } from '@drodil/backstage-plugin-qeta-common';
import { useEffect } from 'react';
import { useTranslation } from '../hooks';

export const imageUpload = (opts: {
  qetaApi: QetaApi;
  errorApi: ErrorApi;
  onImageUpload?: (id: number) => void;
  postId?: number;
  answerId?: number;
  collectionId?: number;
}) => {
  const { qetaApi, errorApi, onImageUpload, postId, answerId, collectionId } =
    opts;
  // eslint-disable-next-line func-names
  return async function* (data: ArrayBuffer) {
    const fileType = await FileType.fromBuffer(data);

    const mimeType = fileType ? fileType.mime : 'text/plain';
    const attachment = await qetaApi.postAttachment(
      new Blob([data], { type: mimeType }),
      { postId, answerId, collectionId },
    );
    if ('errors' in attachment) {
      errorApi.post({
        name: 'Upload failed',
        message: attachment.errors?.map(e => e.message).join(', ') ?? '',
      });
      return false;
    }
    onImageUpload?.(attachment.id);
    yield attachment.locationUri;
    return true;
  };
};

export const formatEntityName = (username?: string) => {
  if (!username) {
    return '';
  }
  const plainName = username.split(/[/:]+/).pop();
  return plainName
    ?.split(/[_.-]+/)
    .map(a => a.charAt(0).toUpperCase() + a.slice(1))
    .join(' ');
};

export const getEntityTitle = (
  entity: Entity,
  opts?: { withType: boolean },
): string => {
  const { withType } = opts || { withType: true };
  const stringified = stringifyEntityRef(entity);
  return `${
    entity.metadata.title ?? formatEntityName(stringified) ?? stringified
  }${withType && entity.spec?.type ? ` (${entity.spec.type})` : ''}`;
};

export const formatDate = (localDate: Date) => {
  let date: any = localDate.getDate();
  let month: any = localDate.getMonth() + 1;
  if (date < 10) {
    date = `0${date}`;
  }

  if (month < 10) {
    month = `0${month}`;
  }
  return `${localDate.getFullYear()}-${month}-${date}`;
};

export type FiltersWithDateRange = Filters & {
  fromDate: string;
  toDate: string;
};

export const getFiltersWithDateRange = (filters: Filters) => {
  let filtersWithDateRange: FiltersWithDateRange;
  const to = new Date();
  const from = new Date(to);
  if (filters.dateRange) {
    let fromDate = '';
    let toDate = '';

    switch (filters.dateRange) {
      case '7-days':
        toDate = formatDate(to);
        from.setDate(to.getDate() - 6);
        fromDate = formatDate(from);
        break;

      case '30-days':
        toDate = formatDate(to);
        from.setDate(to.getDate() - 29);
        fromDate = formatDate(from);
        break;
      default:
        if (filters.dateRange.indexOf('--') > 0) {
          fromDate = filters.dateRange.split('--')[0];
          toDate = filters.dateRange.split('--')[1];
        }
        break;
    }
    if (fromDate && toDate) {
      filtersWithDateRange = { ...filters, fromDate, toDate };
      delete filtersWithDateRange.dateRange;
      return filtersWithDateRange;
    }
  }

  if ('dateRange' in filters) {
    delete filters.dateRange;
  }

  return filters;
};

export const useConfirmNavigationIfEdited = (edited: boolean) => {
  const { t } = useTranslation();
  const msg = t('common.unsaved_changes');
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (edited) {
        event.preventDefault();
        event.returnValue = msg; // Included for legacy support, e.g. Chrome/Edge < 119
      }
    };

    const handleLocationChange = (event: any) => {
      if (edited) {
        // eslint-disable-next-line no-alert
        const response = window.confirm(msg);
        if (!response) {
          event.preventDefault();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    // @ts-ignore
    window.navigation.addEventListener('navigate', handleLocationChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // @ts-ignore
      window.navigation.removeEventListener('navigate', handleLocationChange);
    };
  }, [edited, msg]);
};
