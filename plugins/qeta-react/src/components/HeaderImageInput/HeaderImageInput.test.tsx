import { act, fireEvent, render, screen } from '@testing-library/react';
import { configApiRef, errorApiRef } from '@backstage/core-plugin-api';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import {
  MockConfigApi,
  MockErrorApi,
  mockApis,
  TestApiProvider,
} from '@backstage/test-utils';
import { qetaApiRef } from '../../api';
import { HeaderImageInput } from './HeaderImageInput';

describe('HeaderImageInput', () => {
  const renderInput = (storageDisabled = false) =>
    render(
      <TestApiProvider
        apis={[
          [
            configApiRef,
            new MockConfigApi({
              qeta: { storage: { disabled: storageDisabled } },
            }),
          ],
          [errorApiRef, new MockErrorApi()],
          [translationApiRef, mockApis.translation()],
          [qetaApiRef, {}],
        ]}
      >
        <HeaderImageInput onChange={jest.fn()} onImageUpload={jest.fn()} />
      </TestApiProvider>,
    );

  it('opens the file picker once when Select file is clicked', () => {
    const { container } = renderInput();
    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const click = jest.spyOn(input, 'click');

    fireEvent.click(screen.getByRole('button', { name: 'Select File' }));

    expect(click).toHaveBeenCalledTimes(1);
  });

  it.each(['Enter', ' '])(
    'opens the file picker once when Select file is activated with %s',
    key => {
      const { container } = renderInput();
      const input =
        container.querySelector<HTMLInputElement>('input[type="file"]')!;
      const click = jest.spyOn(input, 'click');
      const button = screen.getByRole('button', { name: 'Select File' });

      act(() => button.focus());
      fireEvent.keyDown(button, { key });
      fireEvent.keyUp(button, { key });

      expect(click).toHaveBeenCalledTimes(1);
    },
  );

  it('still opens the file picker when the dropzone is clicked', () => {
    const { container } = renderInput();
    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const click = jest.spyOn(input, 'click');

    fireEvent.click(input.parentElement!);

    expect(click).toHaveBeenCalledTimes(1);
  });

  it('does not offer file selection when storage is disabled', () => {
    const { container } = renderInput(true);

    expect(
      screen.queryByRole('button', { name: 'Select File' }),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('input[type="file"]'),
    ).not.toBeInTheDocument();
  });
});
