/*global describe, test, expect*/
import * as utils from '@/src/stringUtils';

describe('stringUtils', () => {
  describe('capitalize', () => {
    test('capitalizes the first letter in a string', () => {
      expect(utils.capitalize('ron')).toBe('Ron');
    });
  });

  describe('words', () => {
    test('splits hyphenated strings', () => {
      expect(utils.words('some-text')).toEqual(['some', 'text']);
    });

    test('splits camelCased strings', () => {
      expect(utils.words('someText')).toEqual(['some', 'Text']);
    });

    test('splits snake_cased words', () => {
      expect(utils.words('some_text')).toEqual(['some', 'text']);
    });
  });

  describe('startCase', () => {
    test('transforms string into capitalized words', () => {
      expect(utils.startCase('some-text')).toBe('Some Text');
    });
  });
});
