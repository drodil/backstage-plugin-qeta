// A tag is one or more words joined by "-" or "_". A word is built from
// lowercase or caseless letters in any script (so "säkerhet" and "日本語" are
// valid), decimal digits and "+". Combining marks are allowed after a
// character, for scripts that need them.
const TAG_CHAR = '[\\p{Ll}\\p{Lo}\\p{Lm}\\p{Nd}+]\\p{M}*';
export const TAGS_REGEX = new RegExp(
  `^(?:${TAG_CHAR})+(?:[-_](?:${TAG_CHAR})+)*$`,
  'u',
);

export const isValidTag = (tag: string) => {
  const trimmed = tag.trim();
  return (
    trimmed.length > 0 &&
    trimmed.length < 255 &&
    // Only the composed (NFC) form is valid, so "ä" typed as "a" plus a
    // combining diaeresis can't become a second tag next to "ä".
    trimmed === trimmed.normalize('NFC') &&
    TAGS_REGEX.test(trimmed)
  );
};

export const filterTags = (input?: null | string | string[]) => {
  if (!input) {
    return [];
  }
  return (Array.isArray(input) ? input : input.split(','))
    .map(tag =>
      tag.trim().normalize('NFC').toLocaleLowerCase().replace(/\s+/g, '-'),
    )
    .filter(v => isValidTag(v));
};
