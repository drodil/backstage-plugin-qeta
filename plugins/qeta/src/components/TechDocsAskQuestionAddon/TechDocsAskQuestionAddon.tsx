import { createPortal } from 'react-dom';
import {
  useShadowRootElements,
  useTechDocsReaderPage,
} from '@backstage/plugin-techdocs-react';
import { askRouteRef } from '@drodil/backstage-plugin-qeta-react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { RiQuestionAnswerLine } from '@remixicon/react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { Text } from '@backstage/ui';
import { Link } from 'react-router-dom';
import styles from './TechDocsAskQuestionAddon.module.css';

export const TechDocsAskQuestionAddon = () => {
  const { title, subtitle, entityRef } = useTechDocsReaderPage();
  const [mainContent] = useShadowRootElements([
    '[data-md-component="main"] .md-content',
  ]);

  const askRoute = useRouteRef(askRouteRef);

  const params = new URLSearchParams();
  if (entityRef) {
    params.append('entity', stringifyEntityRef(entityRef));
  }
  if (title) {
    const subtitleSuffix = subtitle ? ` - ${subtitle}` : '';
    params.append('title', `Question about "${title}${subtitleSuffix}"`);
  }
  params.append(
    'content',
    `\n\nThis question relates to ${globalThis.location.href}`,
  );

  return createPortal(
    <div className={styles.root}>
      <Link
        target="_blank"
        className={styles.link}
        to={`${askRoute()}?${params.toString()}`}
      >
        <RiQuestionAnswerLine size={16} />
        <Text as="span">Ask a question about the content</Text>
      </Link>
    </div>,
    mainContent ?? document.body,
  );
};
