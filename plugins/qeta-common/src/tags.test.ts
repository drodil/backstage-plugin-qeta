import { filterTags, TAGS_REGEX } from './tags';

describe('TAGS_REGEX', () => {
  it('should match valid tags', () => {
    expect(TAGS_REGEX.test('tag')).toBe(true);
    expect(TAGS_REGEX.test('tag1')).toBe(true);
    expect(TAGS_REGEX.test('tag-1')).toBe(true);
    expect(TAGS_REGEX.test('tag_1')).toBe(true);
    expect(TAGS_REGEX.test('tag+1')).toBe(true);
  });

  it('should not match invalid tags', () => {
    expect(TAGS_REGEX.test('tag#1')).toBe(false);
    expect(TAGS_REGEX.test('Tag')).toBe(false);
    expect(TAGS_REGEX.test('tag!')).toBe(false);
    expect(TAGS_REGEX.test('tag@')).toBe(false);
    expect(TAGS_REGEX.test('tag$')).toBe(false);
    expect(TAGS_REGEX.test('tag%')).toBe(false);
    expect(TAGS_REGEX.test('tag^')).toBe(false);
    expect(TAGS_REGEX.test('tag&')).toBe(false);
    expect(TAGS_REGEX.test('tag*')).toBe(false);
    expect(TAGS_REGEX.test('tag(')).toBe(false);
    expect(TAGS_REGEX.test('tag)')).toBe(false);
  });
});

describe('filterTags', () => {
  it('should return an empty array if input is null or undefined', () => {
    expect(filterTags(null)).toEqual([]);
    expect(filterTags(undefined)).toEqual([]);
  });

  it('should return an array of valid tags from a comma-separated string', () => {
    expect(filterTags('tag1,tag2,tag-3')).toEqual(['tag1', 'tag2', 'tag-3']);
  });

  it('should return an array of valid tags from an array of strings', () => {
    expect(filterTags(['tag1', 'tag2', 'tag-3'])).toEqual([
      'tag1',
      'tag2',
      'tag-3',
    ]);
  });

  it('should filter out invalid tags', () => {
    expect(filterTags('tag1,tag@,tag-3')).toEqual(['tag1', 'tag-3']);
  });

  it('should filter out tags that are too long', () => {
    const longTag = 'a'.repeat(256);
    expect(filterTags(`tag1,${longTag},tag-3`)).toEqual(['tag1', 'tag-3']);
  });

  it('should filter out empty tags', () => {
    expect(filterTags('tag1,,tag-3')).toEqual(['tag1', 'tag-3']);
  });
});
