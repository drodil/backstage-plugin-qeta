import { ListChildComponentProps, VariableSizeList } from 'react-window';
import {
  HTMLAttributes,
  ReactNode,
  cloneElement,
  createContext,
  forwardRef,
  useContext,
  useRef,
  useEffect,
  Children,
  isValidElement,
} from 'react';
import { ListSubheader, useMediaQuery, useTheme } from '@material-ui/core';
import { AutocompleteRenderGroupParams } from '@material-ui/lab';

const LISTBOX_PADDING = 8; // px

function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props;
  return cloneElement(data[index], {
    style: {
      ...style,
      top: (style.top as number) + LISTBOX_PADDING,
    },
  });
}

const OuterElementContext = createContext({});

const OuterElementType = forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data: any) {
  const ref = useRef<VariableSizeList>(null);
  useEffect(() => {
    if (ref.current !== null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

export const renderGroup = (params: AutocompleteRenderGroupParams) => [
  <ListSubheader key={params.key} component="div">
    {params.group}
  </ListSubheader>,
  params.children,
];

export const AutocompleteListboxComponent = forwardRef<HTMLDivElement>(
  function ListboxComponent(props: HTMLAttributes<HTMLDivElement>, ref) {
    const { children, ...other } = props;
    const itemData = Children.toArray(children);
    const theme = useTheme();
    const smUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true });
    const itemCount = itemData.length;
    const itemSize = smUp ? 36 : 48;

    const getChildSize = (child: ReactNode) => {
      if (isValidElement(child) && child.type === ListSubheader) {
        return 48;
      }

      return itemSize;
    };

    const getHeight = () => {
      if (itemCount > 8) {
        return 8 * itemSize;
      }
      return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
    };

    const gridRef = useResetCache(itemCount);

    return (
      <div ref={ref}>
        <OuterElementContext.Provider value={other}>
          <VariableSizeList
            itemData={itemData}
            height={getHeight() + 2 * LISTBOX_PADDING}
            width="100%"
            style={{
              textWrap: 'nowrap',
              whiteSpace: 'nowrap',
              overflowX: 'hidden',
            }}
            ref={gridRef}
            outerElementType={OuterElementType}
            innerElementType="ul"
            itemSize={index => getChildSize(itemData[index])}
            overscanCount={5}
            itemCount={itemCount}
          >
            {renderRow}
          </VariableSizeList>
        </OuterElementContext.Provider>
      </div>
    );
  },
);
