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

    act(() => {
      screen.getByRole('textbox').focus();
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

    act(() => {
      screen.getByRole('textbox').focus();
    });
    fireEvent.change(screen.getByRole('textbox'), {
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

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '' },
    });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'red' },
    });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    expect(mockQetaApi.getTags).toHaveBeenCalledTimes(1);
  });

  it('should keep fetched tags available when a search returns no matches', async () => {
    render(<TagInput value={[]} onChange={jest.fn()} />, { wrapper });

    act(() => {
      screen.getByRole('textbox').focus();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'react' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'backstage' }),
      ).toBeInTheDocument();
    });

    mockQetaApi.getTags.mockClear();
    mockQetaApi.getTags.mockResolvedValue({ tags: [], total: 0 });

    fireEvent.change(screen.getByRole('textbox'), {
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

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /zzz/i })).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('button', { name: 'react' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'backstage' }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox'), {
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

    act(() => {
      screen.getByRole('textbox').focus();
    });
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'New Tag' },
    });

    expect(screen.getByRole('button', { name: /New Tag/ })).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(mockQetaApi.getTags).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /New Tag/ }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /New Tag/ }));

    expect(handleChange).toHaveBeenCalledWith(['new-tag']);
  });

  describe('pressing Enter', () => {
    const renderAndType = async (text: string, value: string[] = []) => {
      const handleChange = jest.fn();
      // The label matters: BUI renders the field description (where the
      // messages go) only when the field has a label, as in PostForm.
      render(<TagInput value={value} onChange={handleChange} label="Tags" />, {
        wrapper,
      });
      await waitFor(() => {
        expect(mockQetaApi.getTags).toHaveBeenCalledTimes(1);
      });
      const input = screen.getByRole('textbox', { name: 'Tags' });
      act(() => {
        input.focus();
      });
      fireEvent.change(input, { target: { value: text } });
      // fireEvent returns false when the handler called preventDefault, which
      // is what stops the browser from submitting the surrounding form.
      const notPrevented = () => fireEvent.keyDown(input, { key: 'Enter' });
      return { handleChange, input, notPrevented };
    };

    it('adds a new tag', async () => {
      const { handleChange, notPrevented } = await renderAndType('deploy');

      expect(notPrevented()).toBe(false);
      expect(handleChange).toHaveBeenCalledWith(['deploy']);
    });

    it('adds the known tag when the text is another spelling of it', async () => {
      mockQetaApi.getTags.mockResolvedValue({
        tags: [{ tag: 'my-tag' }],
        total: 1,
      });
      const { handleChange, notPrevented } = await renderAndType('My Tag');

      expect(notPrevented()).toBe(false);
      expect(handleChange).toHaveBeenCalledWith(['my-tag']);
    });

    it('does not submit the form on text that is not a valid tag', async () => {
      const { handleChange, input, notPrevented } =
        await renderAndType('säkerhet');

      expect(notPrevented()).toBe(false);
      expect(handleChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('säkerhet');
      expect(
        screen.getByText(
          'Tags can only contain lowercase letters a-z, numbers, +, hyphens and underscores',
        ),
      ).toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'sakerhet' } });

      expect(
        screen.queryByText(/Tags can only contain/),
      ).not.toBeInTheDocument();
    });

    it('does not submit the form when the maximum number of tags is reached', async () => {
      const { handleChange, notPrevented } = await renderAndType('deploy', [
        'a',
        'b',
        'c',
        'd',
        'e',
      ]);

      expect(notPrevented()).toBe(false);
      expect(handleChange).not.toHaveBeenCalled();
      expect(screen.getByText('You can add up to 5 tags')).toBeInTheDocument();
    });

    it('does not submit the form on a tag that is already added', async () => {
      const { handleChange, notPrevented } = await renderAndType('react', [
        'react',
      ]);

      expect(notPrevented()).toBe(false);
      expect(handleChange).not.toHaveBeenCalled();
      expect(
        screen.getByText('Tag react is already added'),
      ).toBeInTheDocument();
    });

    it('does not submit the form on an unknown tag when tag creation is not allowed', async () => {
      mockConfigApi.getOptionalBoolean.mockImplementation((key: string) =>
        key === 'qeta.tags.allowCreation' ? false : undefined,
      );
      const { handleChange, notPrevented } = await renderAndType('deploy');

      expect(notPrevented()).toBe(false);
      expect(handleChange).not.toHaveBeenCalled();
      expect(
        screen.getByText('Select an existing tag from the list'),
      ).toBeInTheDocument();
    });

    it('leaves Enter alone when the field is empty and there is nothing to pick', async () => {
      mockQetaApi.getTags.mockResolvedValue({ tags: [], total: 0 });
      const { handleChange, notPrevented } = await renderAndType('');

      expect(notPrevented()).toBe(true);
      expect(handleChange).not.toHaveBeenCalled();
    });
  });
});
