import { render, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { fireEvent } from '@testing-library/dom';
import { MockErrorApi, TestApiProvider, mockApis } from '@backstage/test-utils';
import { configApiRef, errorApiRef } from '@backstage/core-plugin-api';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { qetaApiRef } from '../../api';
import { EntitiesInput } from './EntitiesInput';

jest.mock('@material-ui/lab', () => ({
  Autocomplete: ({ onOpen, onClose }: any) => (
    <div>
      <button type="button" onClick={() => onOpen?.()}>
        open
      </button>
      <button type="button" onClick={() => onClose?.()}>
        close
      </button>
    </div>
  ),
}));

describe('EntitiesInput', () => {
  const mockCatalogApi = {
    getEntitiesByRefs: jest.fn(),
    getEntityByRef: jest.fn(),
    getEntities: jest.fn(),
  };

  const mockQetaApi = {
    getEntities: jest.fn(),
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestApiProvider
      apis={[
        [qetaApiRef, mockQetaApi],
        [catalogApiRef, mockCatalogApi],
        [translationApiRef, mockApis.translation()],
        [errorApiRef, new MockErrorApi()],
        [configApiRef, {} as any],
      ]}
    >
      {children}
    </TestApiProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();

    mockQetaApi.getEntities.mockResolvedValue({
      entities: [{ entityRef: 'component:default/test-service' }],
      total: 1,
    });
    mockCatalogApi.getEntitiesByRefs.mockResolvedValue({
      items: [
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'test-service',
            namespace: 'default',
            title: 'Test Service',
          },
          spec: {
            type: 'service',
          },
        },
      ],
    });
  });

  it('should fetch entities only once across close and reopen', async () => {
    render(
      <EntitiesInput
        multiple
        value={[]}
        onChange={jest.fn()}
        maximum={3}
        kind={['Component']}
        useOnlyUsedEntities
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByRole('button', { name: 'open' }));

    await waitFor(() => {
      expect(mockQetaApi.getEntities).toHaveBeenCalledTimes(1);
      expect(mockCatalogApi.getEntitiesByRefs).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole('button', { name: 'close' }));
    fireEvent.click(screen.getByRole('button', { name: 'open' }));

    await waitFor(() => {
      expect(mockQetaApi.getEntities).toHaveBeenCalledTimes(1);
      expect(mockCatalogApi.getEntitiesByRefs).toHaveBeenCalledTimes(1);
    });
  });
});
