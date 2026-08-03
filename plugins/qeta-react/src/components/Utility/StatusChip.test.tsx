import { render, screen } from '@testing-library/react';
import { TestApiProvider, mockApis, MockErrorApi } from '@backstage/test-utils';
import { errorApiRef } from '@backstage/core-plugin-api';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { StatusChip } from './StatusChip';

describe('StatusChip', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestApiProvider
      apis={[
        [translationApiRef, mockApis.translation()],
        [errorApiRef, new MockErrorApi()],
      ]}
    >
      {children}
    </TestApiProvider>
  );

  it('renders the draft status without throwing', () => {
    render(<StatusChip status="draft" />, { wrapper });
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders the deleted status without throwing', () => {
    render(<StatusChip status="deleted" />, { wrapper });
    expect(screen.getByText('Deleted')).toBeInTheDocument();
  });

  it('renders nothing for other statuses', () => {
    const { container } = render(<StatusChip status="active" />, {
      wrapper,
    });
    expect(container).toBeEmptyDOMElement();
  });
});
