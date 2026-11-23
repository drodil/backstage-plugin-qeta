import { act, render, screen } from '@testing-library/react';
import { RelativeTimeWithTooltip } from './RelativeTimeWithTooltip';

describe('RelativeTimeWithTooltip', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-11-23T12:00:00Z') });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows how long ago a date string was, in a time element', () => {
    render(<RelativeTimeWithTooltip value="2026-11-23T11:55:00Z" />);

    const time = screen.getByText('5 minutes ago');
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveAttribute('dateTime', '2026-11-23T11:55:00.000Z');
  });

  it('updates the text as time passes', () => {
    render(
      <RelativeTimeWithTooltip value={new Date('2026-11-23T11:59:30Z')} />,
    );
    expect(screen.getByText('30 seconds ago')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5 * 60 * 1000);
    });

    expect(screen.getByText('6 minutes ago')).toBeInTheDocument();
  });

  it('renders no text or machine-readable date for an invalid date', () => {
    const { container } = render(
      <RelativeTimeWithTooltip value="not a date" />,
    );

    const time = container.querySelector('time');
    expect(time).toHaveTextContent('');
    expect(time).not.toHaveAttribute('dateTime');
  });
});
