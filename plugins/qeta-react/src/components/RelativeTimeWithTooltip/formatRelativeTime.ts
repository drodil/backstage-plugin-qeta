/**
 * The distance from `now` to `date` in words, such as "5 minutes ago" or
 * "in 2 days", in the given locales. The steps are the ones
 * react-relative-time used: seconds up to 45 seconds, then minutes up to 45
 * minutes, hours up to 22 hours, days up to 25 days, months up to a year.
 * Returns an empty string for an invalid date.
 */
export function formatRelativeTime(
  date: Date,
  now: number,
  locales?: string | string[],
): string {
  const delta = date.getTime() - now;
  if (Number.isNaN(delta)) {
    return '';
  }
  const [value, unit] = relativeUnit(Math.abs(delta) / 1000);
  // 'auto' only for seconds, so that 0 reads "now". For the larger units it
  // would say "yesterday" or "last month", which name a calendar day or month,
  // while the value counts elapsed time: 23 hours ago can be earlier today.
  const numeric = unit === 'second' ? 'auto' : 'always';
  return new Intl.RelativeTimeFormat(locales, { numeric }).format(
    delta < 0 ? -value : value,
    unit,
  );
}

function relativeUnit(seconds: number): [number, Intl.RelativeTimeFormatUnit] {
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  const years = days / 365;
  if (seconds < 45) return [Math.round(seconds), 'second'];
  if (seconds < 90) return [1, 'minute'];
  if (minutes < 45) return [Math.round(minutes), 'minute'];
  if (minutes < 90) return [1, 'hour'];
  if (hours < 22) return [Math.round(hours), 'hour'];
  if (hours < 35) return [1, 'day'];
  if (days < 25) return [Math.round(days), 'day'];
  if (days < 45) return [1, 'month'];
  if (days < 365) return [Math.round(days / 30), 'month'];
  if (years < 1.5) return [1, 'year'];
  return [Math.round(years), 'year'];
}
