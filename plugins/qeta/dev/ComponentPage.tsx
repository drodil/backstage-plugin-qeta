import { EntityPostsContent } from '../src';
import { EntityProvider } from '@backstage/plugin-catalog-react';

export const ComponentPage = () => {
  return (
    <EntityProvider
      entity={{
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'component',
        metadata: { name: 'test-component' },
      }}
    >
      <EntityPostsContent />
    </EntityProvider>
  );
};
