import { createContext, PropsWithChildren, useContext } from 'react';
import type { PluggableList } from 'unified';

export type QetaExtensionContextProps = {
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
};

export const QetaExtensionContext = createContext<QetaExtensionContextProps>({
  remarkPlugins: [],
  rehypePlugins: [],
});

export const QetaExtensionProvider = (
  props: PropsWithChildren<QetaExtensionContextProps>,
) => {
  return (
    <QetaExtensionContext.Provider value={props}>
      {props.children}
    </QetaExtensionContext.Provider>
  );
};

export function useQetaExtensions(): QetaExtensionContextProps {
  const context = useContext(QetaExtensionContext);

  if (!context) {
    return {
      remarkPlugins: [],
      rehypePlugins: [],
    };
  }

  return context;
}
