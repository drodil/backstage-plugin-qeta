import { filterTags, isValidTag, TAGS_REGEX } from './tags';

describe('TAGS_REGEX', () => {
  it('should match valid tags', () => {
    expect(TAGS_REGEX.test('tag')).toBe(true);
    expect(TAGS_REGEX.test('tag1')).toBe(true);
    expect(TAGS_REGEX.test('tag-1')).toBe(true);
    expect(TAGS_REGEX.test('tag_1')).toBe(true);
    expect(TAGS_REGEX.test('tag+1')).toBe(true);
  });

  it('should match tags with letters outside a-z', () => {
    expect(TAGS_REGEX.test('säkerhet')).toBe(true);
    expect(TAGS_REGEX.test('åäö-öppen_källkod')).toBe(true);
    expect(TAGS_REGEX.test('café')).toBe(true);
    expect(TAGS_REGEX.test('straße')).toBe(true);
    expect(TAGS_REGEX.test('日本語')).toBe(true);
    expect(TAGS_REGEX.test('हिन्दी')).toBe(true);
  });

  it('should not match uppercase letters or punctuation outside a-z', () => {
    expect(TAGS_REGEX.test('Säkerhet')).toBe(false);
    expect(TAGS_REGEX.test('ÅÄÖ')).toBe(false);
    expect(TAGS_REGEX.test('tag…')).toBe(false);
    expect(TAGS_REGEX.test('tag–1')).toBe(false);
    expect(TAGS_REGEX.test('tag·1')).toBe(false);
    expect(TAGS_REGEX.test('🙂')).toBe(false);
    expect(TAGS_REGEX.test('-tag')).toBe(false);
    expect(TAGS_REGEX.test('tag--1')).toBe(false);
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

  it('should lowercase tags with letters outside a-z', () => {
    expect(filterTags('Säkerhet,ÖPPEN KÄLLKOD')).toEqual([
      'säkerhet',
      'öppen-källkod',
    ]);
  });

  it('should store a decomposed letter in its composed form', () => {
    // "ä" typed as "a" followed by a combining diaeresis (U+0308)
    const decomposed = 'säkerhet';
    expect(filterTags(decomposed)).toEqual(['säkerhet']);
    expect(filterTags(decomposed)[0]).toBe('säkerhet');
  });
});

describe('isValidTag', () => {
  it('should accept tags with letters outside a-z', () => {
    expect(isValidTag('säkerhet')).toBe(true);
  });

  it('should reject a decomposed letter so it cannot duplicate the composed tag', () => {
    expect(isValidTag('säkerhet')).toBe(false);
  });
});
