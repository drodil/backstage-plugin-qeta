import { act, render, screen, waitFor } from '@testing-library/react';
import { ReactNode, useState } from 'react';
import { fireEvent } from '@testing-library/dom';
import { MockErrorApi, TestApiProvider, mockApis } from '@backstage/test-utils';
import { configApiRef, errorApiRef } from '@backstage/core-plugin-api';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { qetaApiRef } from '../../api';
import { EntitiesInput } from './EntitiesInput';

jest.mock('@material-ui/lab', () => ({
  Autocomplete: ({
    filterOptions,
    open,
    onOpen,
    onClose,
    onInputChange,
    onChange,
    getOptionLabel,
    inputValue,
    multiple,
    options = [],
    value,
  }: any) => {
    let visibleOptions: any[] = [];

    if (open) {
      if (filterOptions) {
        visibleOptions = filterOptions(options, { inputValue, getOptionLabel });
      } else {
        visibleOptions = options.filter((option: any) =>
          getOptionLabel?.(option)
            ?.toLocaleLowerCase()
            .includes(inputValue.toLocaleLowerCase()),
        );
      }
    }

    return (
      <div>
        <button type="button" onClick={() => onOpen?.()}>
          open
        </button>
        <button type="button" onClick={() => onClose?.()}>
          close
        </button>
        <input
          aria-label="search"
          value={inputValue}
          onChange={event =>
            onInputChange?.(event, event.currentTarget.value, 'input')
          }
        />
        {!multiple && value ? <span>{getOptionLabel?.(value)}</span> : null}
        <div>
          {visibleOptions.map((option: any) => (
            <button
              key={option.metadata?.name ?? option.kind}
              type="button"
              onClick={() => {
                onChange?.(undefined, option);
                if (!multiple) {
                  onClose?.();
                }
              }}
            >
              {getOptionLabel?.(option)}
            </button>
          ))}
        </div>
      </div>
    );
  },
}));

const testServiceEntity: Entity = {
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
};

const alphaServiceEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'alpha-service',
    namespace: 'default',
    title: 'Alpha Service',
  },
  spec: {
    type: 'service',
  },
};

const currentUserEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'User',
  metadata: {
    name: 'current-user',
    namespace: 'default',
  },
  spec: {
    profile: {
      displayName: 'Current User',
    },
  },
};

const otherUserEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'User',
  metadata: {
    name: 'other-user',
    namespace: 'default',
  },
  spec: {
    profile: {
      displayName: 'Other User',
    },
  },
};

describe('EntitiesInput', () => {
  const mockConfigApi = {
    getOptionalStringArray: jest.fn().mockReturnValue(undefined),
    getOptionalNumber: jest.fn().mockReturnValue(undefined),
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  const mockCatalogApi = {
    getEntitiesByRefs: jest.fn(),
    getEntityByRef: jest.fn(),
    getEntities: jest.fn(),
    queryEntities: jest.fn(),
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
        [configApiRef, mockConfigApi as any],
      ]}
    >
      {children}
    </TestApiProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfigApi.getOptionalStringArray.mockReturnValue(undefined);
    mockConfigApi.getOptionalNumber.mockReturnValue(undefined);

    mockQetaApi.getEntities.mockResolvedValue({
      entities: [{ entityRef: 'component:default/test-service' }],
      total: 1,
    });
    mockCatalogApi.getEntitiesByRefs.mockResolvedValue({
      items: [testServiceEntity],
    });
    mockCatalogApi.queryEntities.mockResolvedValue({ items: [] });
  });

  it('should preload used entities on mount', async () => {
    render(
      <EntitiesInput multiple value={[]} onChange={jest.fn()} maximum={3} />,
      { wrapper },
    );

    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(mockQetaApi.getEntities).toHaveBeenCalledTimes(1);
      expect(mockCatalogApi.getEntitiesByRefs).toHaveBeenCalledTimes(1);
    });

    expect(mockCatalogApi.getEntities).not.toHaveBeenCalled();
    expect(mockCatalogApi.queryEntities).not.toHaveBeenCalled();
    expect(mockQetaApi.getEntities).toHaveBeenCalledWith({
      limit: 25,
      orderBy: 'postsCount',
      order: 'desc',
    });
  });

  it('should preload catalog examples when kind is provided', async () => {
    mockCatalogApi.queryEntities.mockResolvedValue({
      items: [currentUserEntity, otherUserEntity],
    });

    render(
      <EntitiesInput
        multiple={false}
        value={null}
        onChange={jest.fn()}
        maximum={1}
        kind={['User']}
      />,
      { wrapper },
    );

    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(mockCatalogApi.queryEntities).toHaveBeenCalledTimes(1);
    });

    expect(mockQetaApi.getEntities).not.toHaveBeenCalled();
    expect(mockCatalogApi.queryEntities).toHaveBeenCalledWith({
      fields: [
        'kind',
        'metadata.name',
        'metadata.namespace',
        'metadata.title',
        'metadata.description',
        'spec.type',
        'spec.profile.displayName',
        'spec.profile.email',
      ],
      limit: 25,
      orderFields: [{ field: 'metadata.name', order: 'asc' }],
      query: { kind: 'User' },
    });
  });

  it('should not refetch catalog defaults when kind array identity changes', async () => {
    mockCatalogApi.queryEntities.mockResolvedValue({
      items: [currentUserEntity, otherUserEntity],
    });

    const onChange = jest.fn();
    const { rerender } = render(
      <EntitiesInput
        multiple={false}
        value={null}
        onChange={onChange}
        maximum={1}
        kind={['User']}
      />,
      { wrapper },
    );

    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(mockCatalogApi.queryEntities).toHaveBeenCalledTimes(1);
    });

    mockCatalogApi.queryEntities.mockClear();

    rerender(
      <EntitiesInput
        multiple={false}
        value={null}
        onChange={onChange}
        maximum={1}
        kind={['User']}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(350);
    });

    expect(mockCatalogApi.queryEntities).not.toHaveBeenCalled();
  });

  it('should search the catalog from typed input and reuse cached results', async () => {
    mockCatalogApi.queryEntities.mockResolvedValue({
      items: [testServiceEntity],
    });

    render(
      <EntitiesInput
        multiple
        value={[]}
        onChange={jest.fn()}
        maximum={3}
        kind={['Component']}
      />,
      { wrapper },
    );

    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(mockCatalogApi.queryEntities).toHaveBeenCalledTimes(1);
    });

    mockCatalogApi.queryEntities.mockClear();

    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'search' }), {
      target: { value: 'test' },
    });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(mockCatalogApi.queryEntities).toHaveBeenCalledTimes(1);
    });

    expect(mockCatalogApi.queryEntities).toHaveBeenCalledWith({
      fields: [
        'kind',
        'metadata.name',
        'metadata.namespace',
        'metadata.title',
        'metadata.description',
        'spec.type',
        'spec.profile.displayName',
        'spec.profile.email',
      ],
      fullTextFilter: {
        term: 'test',
        fields: [
          'metadata.name',
          'metadata.title',
          'spec.profile.displayName',
          'spec.profile.email',
        ],
      },
      limit: 25,
      orderFields: [{ field: 'metadata.name', order: 'asc' }],
      query: { kind: 'Component' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'close' }));
    fireEvent.click(screen.getByRole('button', { name: 'open' }));

    act(() => {
      jest.advanceTimersByTime(350);
    });

    expect(mockCatalogApi.queryEntities).toHaveBeenCalledTimes(1);
  });

  it('should show and update the default single value', async () => {
    mockCatalogApi.queryEntities.mockResolvedValue({
      items: [currentUserEntity, otherUserEntity],
    });

    const Wrapper = () => {
      const [selectedEntity, setSelectedEntity] = useState<Entity | null>(
        currentUserEntity,
      );

      return (
        <EntitiesInput
          multiple={false}
          value={selectedEntity}
          onChange={setSelectedEntity}
          maximum={1}
          kind={['User']}
        />
      );
    };

    render(<Wrapper />, { wrapper });

    expect(screen.getByRole('textbox', { name: 'search' })).toHaveValue(
      'Current User',
    );

    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(mockCatalogApi.queryEntities).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole('button', { name: 'open' }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Other User' }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Other User' }));

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'search' })).toHaveValue(
        'Other User',
      );
    });
  });

  it('should keep fetched entities available and filter them by the current input', async () => {
    mockCatalogApi.queryEntities
      .mockResolvedValueOnce({ items: [alphaServiceEntity] })
      .mockResolvedValueOnce({ items: [testServiceEntity] });

    render(
      <EntitiesInput
        multiple
        value={[]}
        onChange={jest.fn()}
        maximum={3}
        kind={['Component']}
      />,
      { wrapper },
    );

    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(mockCatalogApi.queryEntities).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole('button', { name: 'open' }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Alpha Service/ }),
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('textbox', { name: 'search' }), {
      target: { value: 'test' },
    });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(mockCatalogApi.queryEntities).toHaveBeenCalledTimes(2);
      expect(
        screen.getByRole('button', { name: /Test Service/ }),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('button', { name: /Alpha Service/ }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: 'search' }), {
      target: { value: '' },
    });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    expect(mockCatalogApi.queryEntities).toHaveBeenCalledTimes(2);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Alpha Service/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Test Service/ }),
      ).toBeInTheDocument();
    });
  });

  it('should search used entities without fetching everything on open', async () => {
    render(
      <EntitiesInput
        multiple
        value={[]}
        onChange={jest.fn()}
        maximum={3}
        useOnlyUsedEntities
      />,
      { wrapper },
    );

    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(mockQetaApi.getEntities).toHaveBeenCalledTimes(1);
      expect(mockCatalogApi.getEntitiesByRefs).toHaveBeenCalledTimes(1);
    });

    expect(mockQetaApi.getEntities).toHaveBeenCalledWith({
      limit: 25,
      orderBy: 'postsCount',
      order: 'desc',
    });

    fireEvent.click(screen.getByRole('button', { name: 'open' }));

    fireEvent.change(screen.getByRole('textbox', { name: 'search' }), {
      target: { value: 'service' },
    });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(mockQetaApi.getEntities).toHaveBeenCalledTimes(2);
      expect(mockCatalogApi.getEntitiesByRefs).toHaveBeenCalledTimes(2);
    });

    expect(mockQetaApi.getEntities).toHaveBeenNthCalledWith(2, {
      searchQuery: 'service',
      limit: 25,
      orderBy: 'postsCount',
      order: 'desc',
    });
  });
});
