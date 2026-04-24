import { act, render, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { fireEvent } from '@testing-library/dom';
import { MockErrorApi, TestApiProvider, mockApis } from '@backstage/test-utils';
import { configApiRef, errorApiRef } from '@backstage/core-plugin-api';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { qetaApiRef } from '../../api';
import { TagInput } from './TagInput';

jest.mock('@material-ui/lab', () => ({
  Autocomplete: ({
    filterOptions,
    freeSolo,
    getOptionLabel,
    onChange,
    onInputChange,
    options = [],
    inputValue,
    value = [],
  }: any) => {
    const visibleOptions = filterOptions
      ? filterOptions(options, { inputValue, getOptionLabel })
      : options.filter((option: any) =>
          getOptionLabel(option)
            .toLocaleLowerCase()
            .includes(inputValue.toLocaleLowerCase()),
        );

    return (
      <div>
        <input
          aria-label="tag-search"
          value={inputValue}
          onChange={event =>
            onInputChange?.(event, event.currentTarget.value, 'input')
          }
        />
        <div>
          {visibleOptions.map((option: any) => (
            <button
              key={typeof option === 'string' ? option : option.inputValue}
              type="button"
              onClick={() => {
                if (freeSolo || typeof option === 'string') {
                  onChange?.(undefined, [...value, option]);
                }
              }}
            >
              {getOptionLabel(option)}
            </button>
          ))}
        </div>
      </div>
    );
  },
}));

describe('TagInput', () => {
  const mockConfigApi = {
    getOptionalBoolean: jest.fn(),
    getOptionalStringArray: jest.fn(),
    getOptionalNumber: jest.fn(),
  };

  const mockPermissionApi = {
    authorize: jest.fn(),
  };

  const mockQetaApi = {
    getTags: jest.fn(),
    getTagSuggestions: jest.fn(),
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestApiProvider
      apis={[
        [qetaApiRef, mockQetaApi],
        [translationApiRef, mockApis.translation()],
        [errorApiRef, new MockErrorApi()],
        [configApiRef, mockConfigApi as any],
        [permissionApiRef, mockPermissionApi as any],
      ]}
    >
      {children}
    </TestApiProvider>
  );

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    mockConfigApi.getOptionalBoolean.mockImplementation((key: string) => {
      if (key === 'qeta.permissions') {
        return false;
      }
      if (key === 'qeta.tags.allowCreation') {
        return true;
      }
      return undefined;
    });
    mockConfigApi.getOptionalStringArray.mockReturnValue(undefined);
    mockConfigApi.getOptionalNumber.mockReturnValue(undefined);
    mockPermissionApi.authorize.mockResolvedValue({
      result: AuthorizeResult.ALLOW,
    });
    mockQetaApi.getTagSuggestions.mockResolvedValue({ tags: [] });
    mockQetaApi.getTags.mockResolvedValue({
      tags: [
        { tag: 'react', description: 'React tag' },
        { tag: 'backstage', description: 'Backstage tag' },
      ],
      total: 2,
    });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('should preload most used tags on mount', async () => {
    render(<TagInput value={[]} onChange={jest.fn()} />, { wrapper });

    await waitFor(() => {
      expect(mockQetaApi.getTags).toHaveBeenCalledTimes(1);
    });

    expect(mockQetaApi.getTags).toHaveBeenCalledWith({
      limit: 25,
      orderBy: 'postsCount',
      order: 'desc',
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'react' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'backstage' }),
      ).toBeInTheDocument();
    });
  });

  it('should search tags from qetaApi when typing and reuse cached results', async () => {
    render(<TagInput value={[]} onChange={jest.fn()} />, { wrapper });

    await waitFor(() => {
      expect(mockQetaApi.getTags).toHaveBeenCalledTimes(1);
    });

    mockQetaApi.getTags.mockClear();
    mockQetaApi.getTags.mockResolvedValue({
      tags: [{ tag: 'redux', description: 'Redux tag' }],
      total: 1,
    });

    fireEvent.change(screen.getByRole('textbox', { name: 'tag-search' }), {
      target: { value: 'red' },
    });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(mockQetaApi.getTags).toHaveBeenCalledTimes(1);
    });

    expect(mockQetaApi.getTags).toHaveBeenCalledWith({
      searchQuery: 'red',
      limit: 25,
      orderBy: 'postsCount',
      order: 'desc',
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'redux' })).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('button', { name: 'react' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'backstage' }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: 'tag-search' }), {
      target: { value: '' },
    });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    fireEvent.change(screen.getByRole('textbox', { name: 'tag-search' }), {
      target: { value: 'red' },
    });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    expect(mockQetaApi.getTags).toHaveBeenCalledTimes(1);
  });

  it('should keep fetched tags available when a search returns no matches', async () => {
    render(<TagInput value={[]} onChange={jest.fn()} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'react' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'backstage' }),
      ).toBeInTheDocument();
    });

    mockQetaApi.getTags.mockClear();
    mockQetaApi.getTags.mockResolvedValue({ tags: [], total: 0 });

    fireEvent.change(screen.getByRole('textbox', { name: 'tag-search' }), {
      target: { value: 'zzz' },
    });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(mockQetaApi.getTags).toHaveBeenCalledWith({
        searchQuery: 'zzz',
        limit: 25,
        orderBy: 'postsCount',
        order: 'desc',
      });
    });

    expect(screen.getByRole('button', { name: /zzz/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'react' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'backstage' }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: 'tag-search' }), {
      target: { value: '' },
    });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'react' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'backstage' }),
      ).toBeInTheDocument();
    });
  });

  it('should allow adding a new tag with freeSolo', async () => {
    const handleChange = jest.fn();

    render(<TagInput value={[]} onChange={handleChange} />, { wrapper });

    await waitFor(() => {
      expect(mockQetaApi.getTags).toHaveBeenCalledTimes(1);
    });

    mockQetaApi.getTags.mockClear();

    fireEvent.change(screen.getByRole('textbox', { name: 'tag-search' }), {
      target: { value: 'New Tag' },
    });

    expect(screen.getByRole('button', { name: /New Tag/ })).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(mockQetaApi.getTags).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole('button', { name: /New Tag/ }));

    expect(handleChange).toHaveBeenCalledWith(['new-tag']);
  });
});
