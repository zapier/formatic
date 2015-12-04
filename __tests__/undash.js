/*global describe, it, expect*/
'use strict';

describe('utils', () => {

  var _ = require('../lib/undash');

  it('should flatten', () => {

    expect(_.flatten([['foo', 'bar'], 'baz'])).toEqual(['foo', 'bar', 'baz']);
  });

  it('should each over object', () => {

    var obj = {a: 1, b: 2};

    var keys = [];
    var values = [];

    _.each(obj, (value, key) => {
      values.push(value);
      keys.push(key);
    });

    expect(values).toEqual([1, 2]);
    expect(keys).toEqual(['a', 'b']);
  });

  it('should clone object', () => {

    var obj = {a: 1, b: 2};

    var clone = _.clone(obj);

    expect(obj === clone).toEqual(false);
    expect(clone).toEqual(obj);
    expect(_.clone(5)).toEqual(5);
  });

  it('should find item', () => {

    var array = [1, 2, 3, 4, 5];

    var foundItem = _.find(array, (item) => {
      return item > 3;
    });

    expect(foundItem).toEqual(4);
  });

  it('should test for objects', () => {
    expect(_.isObject({})).toBe(true);
    expect(_.isObject(null)).toBeFalsy();
  });

});
