import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import type { PluggableList } from 'unified';

export type QetaContextProps = {
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
  draftQuestion?: {
    title: string;
    content: string;
    tags?: string[];
    entities?: string[];
  };
  setDraftQuestion?: Dispatch<
    SetStateAction<
      | {
          title: string;
          content: string;
          tags?: string[];
          entities?: string[];
        }
      | undefined
    >
  >;
};

export const QetaContext = createContext<QetaContextProps>({
  remarkPlugins: [],
  rehypePlugins: [],
});

export const QetaProvider = (props: PropsWithChildren<QetaContextProps>) => {
  const [draftQuestion, setDraftQuestion] = useState<
    | {
        title: string;
        content: string;
        tags?: string[];
        entities?: string[];
      }
    | undefined
  >(undefined);

  return (
    <QetaContext.Provider value={{ ...props, draftQuestion, setDraftQuestion }}>
      {props.children}
    </QetaContext.Provider>
  );
};

export function useQetaContext(): QetaContextProps {
  const context = useContext(QetaContext);

  if (!context) {
    return {
      remarkPlugins: [],
      rehypePlugins: [],
      draftQuestion: undefined,
      setDraftQuestion: undefined,
    };
  }

  return context;
}
