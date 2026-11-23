import { formatRelativeTime } from './formatRelativeTime';

const now = Date.UTC(2026, 10, 23, 12, 0, 0);
const ago = (seconds: number) => new Date(now - seconds * 1000);

describe('formatRelativeTime', () => {
  it('describes past times with the steps react-relative-time used', () => {
    expect(formatRelativeTime(ago(0), now, 'en')).toBe('now');
    expect(formatRelativeTime(ago(30), now, 'en')).toBe('30 seconds ago');
    expect(formatRelativeTime(ago(60), now, 'en')).toBe('1 minute ago');
    expect(formatRelativeTime(ago(5 * 60), now, 'en')).toBe('5 minutes ago');
    expect(formatRelativeTime(ago(50 * 60), now, 'en')).toBe('1 hour ago');
    expect(formatRelativeTime(ago(3 * 3600), now, 'en')).toBe('3 hours ago');
    expect(formatRelativeTime(ago(23 * 3600), now, 'en')).toBe('1 day ago');
    expect(formatRelativeTime(ago(4 * 86400), now, 'en')).toBe('4 days ago');
    expect(formatRelativeTime(ago(30 * 86400), now, 'en')).toBe('1 month ago');
    expect(formatRelativeTime(ago(90 * 86400), now, 'en')).toBe('3 months ago');
    expect(formatRelativeTime(ago(400 * 86400), now, 'en')).toBe('1 year ago');
    expect(formatRelativeTime(ago(3 * 365 * 86400), now, 'en')).toBe(
      '3 years ago',
    );
  });

  it('counts elapsed time, not calendar days, months or years', () => {
    // 22.5 hours before 23:30 is 01:00 the same day, so not "yesterday".
    const lateEvening = Date.UTC(2026, 10, 23, 23, 30, 0);
    const sameDay = new Date(Date.UTC(2026, 10, 23, 1, 0, 0));
    expect(formatRelativeTime(sameDay, lateEvening, 'en')).toBe('1 day ago');
    expect(formatRelativeTime(ago(-30 * 86400), now, 'en')).toBe('in 1 month');
  });

  it('describes future times', () => {
    expect(formatRelativeTime(ago(-2 * 86400), now, 'en')).toBe('in 2 days');
  });

  it('uses the given locale', () => {
    expect(formatRelativeTime(ago(5 * 60), now, 'sv')).toBe(
      'för 5 minuter sedan',
    );
  });

  it('returns an empty string for an invalid date', () => {
    expect(formatRelativeTime(new Date('not a date'), now, 'en')).toBe('');
  });
});
