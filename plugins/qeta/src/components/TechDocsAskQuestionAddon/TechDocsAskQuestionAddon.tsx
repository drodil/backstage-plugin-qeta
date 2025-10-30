import { makeStyles, Portal, Typography } from '@material-ui/core';
import {
  useShadowRootElements,
  useTechDocsReaderPage,
} from '@backstage/plugin-techdocs-react';
import { Link } from '@backstage/core-components';
import { askRouteRef } from '@drodil/backstage-plugin-qeta-react';
import { useRouteRef } from '@backstage/core-plugin-api';
import ContactSupportIcon from '@material-ui/icons/ContactSupport';
import { stringifyEntityRef } from '@backstage/catalog-model';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(1),
  },
  link: {
    display: 'grid',
    gridAutoFlow: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
}));

export const TechDocsAskQuestionAddon = () => {
  const styles = useStyles();
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
    params.append(
      'title',
      `Question about "${title}${subtitle ? ` - ${subtitle}` : ''}"`,
    );
  }
  params.append(
    'content',
    `\n\nThis question relates to ${window.location.href}`,
  );

  return (
    <Portal container={mainContent}>
      <div className={styles.root}>
        <Link
          target="_blank"
          className={styles.link}
          to={`${askRoute()}?${params.toString()}`}
        >
          <ContactSupportIcon />
          <Typography>Ask a question about the content</Typography>
        </Link>
      </div>
    </Portal>
  );
};
