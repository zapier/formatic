/*global describe, it, expect*/
'use strict';

import _ from '../lib/undash';

describe('utils', () => {
  it('should flatten', () => {
    expect(_.flatten([['foo', 'bar'], 'baz'])).toEqual(['foo', 'bar', 'baz']);
  });

  it('should compact', () => {
    expect(_.compact([])).toEqual([]);
    expect(_.compact(null)).toEqual([]);
    expect(_.compact(undefined)).toEqual([]);
    expect(_.compact([1, 2, 3])).toEqual([1, 2, 3]);
    expect(_.compact([0, 1, 2, 3, NaN, null, undefined, false])).toEqual([
      1,
      2,
      3,
    ]);
    expect(() => _.compact('asdf')).toThrow();
    expect(() => _.compact({})).toThrow();
  });

  it('should each over object', () => {
    const obj = { a: 1, b: 2 };

    const keys = [];
    const values = [];

    _.each(obj, (value, key) => {
      values.push(value);
      keys.push(key);
    });

    expect(values).toEqual([1, 2]);
    expect(keys).toEqual(['a', 'b']);
  });

  it('should clone object', () => {
    const obj = { a: 1, b: 2 };

    const clone = _.clone(obj);

    expect(obj === clone).toEqual(false);
    expect(clone).toEqual(obj);
    expect(_.clone(5)).toEqual(5);
  });

  it('should find item', () => {
    const array = [1, 2, 3, 4, 5];

    const foundItem = _.find(array, item => {
      return item > 3;
    });

    expect(foundItem).toEqual(4);
  });

  it('should test for objects', () => {
    expect(_.isObject({})).toBe(true);
    expect(_.isObject(null)).toBeFalsy();
  });
});
