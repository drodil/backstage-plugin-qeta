import { Entity } from '@backstage/catalog-model';
import { coreExtensionData } from '@backstage/frontend-plugin-api';
import {
  createExtensionTester,
  renderInTestApp,
} from '@backstage/frontend-test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { EntityContextMenuItemBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { qetaRouteRef } from '@drodil/backstage-plugin-qeta-react';
import { screen } from '@testing-library/react';
import qetaPlugin from './index';

describe('qeta', () => {
  it('should export plugin', () => {
    expect(qetaPlugin).toBeDefined();
  });

  it('exposes the root route ref without conversion', () => {
    expect(qetaPlugin.routes.root).toBe(qetaRouteRef);
  });

  it('mounts the page on the root route ref', () => {
    const tester = createExtensionTester(qetaPlugin.getExtension('page:qeta'));

    expect(tester.get(coreExtensionData.routeRef)).toBe(qetaRouteRef);
    expect(tester.get(coreExtensionData.routePath)).toBe('/qeta');
  });

  describe('entity context menu item', () => {
    const { useProps } = createExtensionTester(
      qetaPlugin.getExtension(
        'entity-context-menu-item:qeta/ask-question-context-menu',
      ),
    ).get(EntityContextMenuItemBlueprint.dataRefs.data);

    const MenuItemProps = () => {
      const props = useProps();
      if (!('href' in props)) {
        throw new Error('Expected an href menu item');
      }
      return (
        <a href={props.href} aria-disabled={props.disabled}>
          {props.title}
        </a>
      );
    };

    const renderForKind = (kind: string) => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind,
        metadata: { name: 'my-entity', namespace: 'default' },
      };
      return renderInTestApp(
        <EntityProvider entity={entity}>
          <MenuItemProps />
        </EntityProvider>,
        { mountedRoutes: { '/qeta': qetaRouteRef } },
      );
    };

    it('links to the ask page for a supported entity kind', async () => {
      renderForKind('Component');

      const link = await screen.findByRole('link', { name: 'Ask a question' });
      expect(link).toHaveAttribute(
        'href',
        '/qeta/questions/ask/?entity=component:default/my-entity',
      );
      expect(link).toHaveAttribute('aria-disabled', 'false');
    });

    it('is disabled for an unsupported entity kind', async () => {
      renderForKind('Group');

      const link = await screen.findByRole('link', { name: 'Ask a question' });
      expect(link).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
