import { useTheme, useMediaQuery } from '@material-ui/core';

export type GridType = 'posts' | 'tags' | 'entities' | 'users' | 'collections';

export function useGridPageSize(
  gridType: GridType,
  basePageSize: number = 24,
): number {
  const theme = useTheme();

  const isXl = useMediaQuery(theme.breakpoints.up('xl'));
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isMd = useMediaQuery(theme.breakpoints.up('md'));
  const isSm = useMediaQuery(theme.breakpoints.up('sm'));

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
