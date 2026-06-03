import { useCallback, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  StyleSheet,
  useWindowDimensions,
  ViewStyle,
} from 'react-native';
import { moderateScale } from '@/utils/responsive';
import { homeLayout } from './homeLayout';

export type HomeGridColumns = 2 | 3 | 4;

/** Pick column count from item count and screen width */
export function resolveHomeGridColumns(
  itemCount: number,
  screenWidth: number,
): HomeGridColumns {
  if (itemCount === 3) {
    return 3;
  }
  if (itemCount <= 2) {
    return 2;
  }
  if (itemCount >= 4 && screenWidth >= 400) {
    return 4;
  }
  return 3;
}

/** Width for one tile so the row fills the container (handles partial last rows) */
export function computeTileWidth(
  index: number,
  itemCount: number,
  columns: number,
  containerWidth: number,
  gap: number,
): number {
  const rowIndex = Math.floor(index / columns);
  const totalRows = Math.ceil(itemCount / columns);
  const isLastRow = rowIndex === totalRows - 1;
  const itemsInRow = isLastRow
    ? itemCount - rowIndex * columns
    : columns;

  return Math.floor(
    (containerWidth - gap * Math.max(itemsInRow - 1, 0)) / itemsInRow,
  );
}

export type HomeGridLayout = {
  columns: HomeGridColumns;
  gap: number;
  tileMinHeight: number;
  gridStyle: ViewStyle;
  onGridLayout: (event: LayoutChangeEvent) => void;
  getTileStyle: (index: number) => ViewStyle;
};

/**
 * Measures the real grid width via onLayout and sizes each tile so rows fill edge-to-edge.
 */
export function useHomeGridLayout(
  itemCount: number,
  forcedColumns?: HomeGridColumns,
): HomeGridLayout {
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);

  const columns = forcedColumns ?? resolveHomeGridColumns(itemCount, screenWidth);
  const gap = homeLayout.tileGap;
  const tileMinHeight = Math.round(moderateScale(homeLayout.tileMinHeight, 0.3));

  const estimatedWidth =
    screenWidth -
    homeLayout.screenPaddingH * 2 -
    homeLayout.cardPadding * 2;

  const onGridLayout = useCallback((event: LayoutChangeEvent) => {
    const measured = Math.floor(event.nativeEvent.layout.width);
    if (measured > 0) {
      setContainerWidth(measured);
    }
  }, []);

  const activeWidth = containerWidth > 0 ? containerWidth : estimatedWidth;

  const getTileStyle = useCallback(
    (index: number): ViewStyle => {
      const tileWidth = computeTileWidth(
        index,
        itemCount,
        columns,
        activeWidth,
        gap,
      );

      return {
        width: tileWidth,
        minHeight: tileMinHeight,
        ...homeTileStyles.base,
      };
    },
    [activeWidth, columns, gap, itemCount, tileMinHeight],
  );

  const gridStyle: ViewStyle = useMemo(
    () => ({
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap,
      marginTop: homeLayout.tileGridMarginTop,
      width: '100%',
    }),
    [gap],
  );

  return {
    columns,
    gap,
    tileMinHeight,
    gridStyle,
    onGridLayout,
    getTileStyle,
  };
}

/** @deprecated Use useHomeGridLayout for fill-width rows */
export function useHomeGrid(itemCount: number, forcedColumns?: HomeGridColumns) {
  const layout = useHomeGridLayout(itemCount, forcedColumns);
  const tileStyle = layout.getTileStyle(0);

  return {
    columns: layout.columns,
    gap: layout.gap,
    tileWidth: tileStyle.width as number,
    tileMinHeight: layout.tileMinHeight,
    gridStyle: layout.gridStyle,
    tileStyle,
    onGridLayout: layout.onGridLayout,
    getTileStyle: layout.getTileStyle,
  };
}

export const homeTileStyles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderRadius: homeLayout.tileRadius,
    padding: homeLayout.tilePadding,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
    marginTop: 4,
    lineHeight: 13,
  },
});
