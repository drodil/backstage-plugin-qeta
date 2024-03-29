export const TAGS_REGEX = new RegExp('^[a-z0-9+#]+((\\-|_)[a-z0-9+#_]+)*$');

export const filterTags = (input?: null | string | string[]) => {
  if (!input) {
    return undefined;
  }
  return (Array.isArray(input) ? input : input.split(',')).filter(
    v => v.length > 0 && v.length < 255 && TAGS_REGEX.test(v),
  );
};
