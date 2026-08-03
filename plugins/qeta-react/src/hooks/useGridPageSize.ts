import { useBreakpoint } from '@backstage/ui';

export type GridType = 'posts' | 'tags' | 'entities' | 'users' | 'collections';

export function useGridPageSize(
  gridType: GridType,
  basePageSize: number = 24,
): number {
  const { up } = useBreakpoint();
  const isXl = up('xl');
  const isLg = up('lg');
  const isMd = up('md');
  const isSm = up('sm');

  let itemsPerRow: number;

  switch (gridType) {
    case 'tags':
    case 'entities':
      if (isXl) {
        itemsPerRow = 3;
      } else if (isSm) {
        itemsPerRow = 2;
      } else {
        itemsPerRow = 1;
      }
      break;

    case 'users':
      if (isXl) {
        itemsPerRow = 3;
      } else if (isMd) {
        itemsPerRow = 2;
      } else {
        itemsPerRow = 1;
      }
      break;

    case 'posts':
      if (isXl) {
        itemsPerRow = 2;
      } else {
        itemsPerRow = 1;
      }
      break;

    case 'collections':
      if (isLg) {
        itemsPerRow = 2;
      } else {
        itemsPerRow = 1;
      }
      break;

    default:
      itemsPerRow = 1;
  }

  const remainder = basePageSize % itemsPerRow;
  if (remainder === 0) {
    return basePageSize;
  }
  return basePageSize + (itemsPerRow - remainder);
}
