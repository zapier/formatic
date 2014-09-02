/*global describe, it, expect*/
'use strict';

describe('utils', function() {

  var utils = require('../lib/utils');

  it('should wrap function with no wrappers', function () {

    var greet = function () {
      return 'hello!';
    };

    var wrapped = utils.wrapFn(greet, []);

    expect(wrapped()).toEqual('hello!');

  });

  it('should wrap function with one wrapper', function () {

    var greet = function () {
      return 'hello!';
    };

    var upper = function (next) {
      return next().toUpperCase();
    };

    var wrapped = utils.wrapFn(greet, [upper]);

    expect(wrapped()).toEqual('HELLO!');

  });

  it('should wrap function with two wrappers', function () {

    var greet = function () {
      return 'hello!';
    };

    var upper = function (next) {
      return next().toUpperCase();
    };

    var j = function (next) {
      return next().replace('H', 'J');
    };

    var wrapped = utils.wrapFn(greet, [j, upper]);

    expect(wrapped()).toEqual('JELLO!');

  });

  it('should auto pass on arguments', function () {

    var addNumbers = function (array) {
      return array.reduce(function (prev, curr) {return prev + curr;});
    };

    var pushNumber = function (next, array) {
      array.push(array.length + 1);
      return next();
    };

    var wrapped = utils.wrapFn(addNumbers, [pushNumber, pushNumber]);

    expect(wrapped([1,2])).toEqual(10);

  });

  it('should manual pass on arguments', function () {

    var addNumbers = function (array) {
      return array.reduce(function (prev, curr) {return prev + curr;});
    };

    var pushNumber = function (next, array) {
      var newArray = array.slice(0);
      newArray.push(newArray.length + 1);
      return next(newArray);
    };

    var wrapped = utils.wrapFn(addNumbers, [pushNumber, pushNumber]);

    expect(wrapped([1,2])).toEqual(10);

  });

  it('should make an object wrappable', function () {

    var obj = {};

    utils.wrappable(obj);

    obj.greet = function () {
      return 'Hello';
    };

    obj.wrap('greet', function (next) {
      return next().toUpperCase();
    });

    obj.wrap('greet', function (next) {
      return next() + ', Bob!';
    });

    expect(obj.greet()).toEqual('HELLO, BOB!');

    obj.greet = function () {
      return 'Hola';
    };

    obj.wrap('greet', function (next) {
      return next().toUpperCase();
    });

    obj.wrap('greet', function (next) {
      return next() + ', Bob!';
    });

    expect(obj.greet()).toEqual('HOLA, BOB!');

  });

  it('should parse blank text', function () {

    expect(utils.parseTextWithTags('')).toEqual([]);
  });

  it('should parse plain text', function () {

    expect(utils.parseTextWithTags('foo')).toEqual([{type: 'text', value: 'foo'}]);
  });

  it('should parse text with tag in middle', function () {

    expect(utils.parseTextWithTags('foo {{bar}} baz')).toEqual([
      {type: 'text', value: 'foo '},
      {type: 'tag', value: 'bar'},
      {type: 'text', value: ' baz'}
    ]);
  });

  it('should parse text with tag at front', function () {

    expect(utils.parseTextWithTags('{{bar}} baz')).toEqual([
      {type: 'tag', value: 'bar'},
      {type: 'text', value: ' baz'}
    ]);
  });

  it('should parse text with tag at back', function () {

    expect(utils.parseTextWithTags('{{bar}} baz')).toEqual([
      {type: 'tag', value: 'bar'},
      {type: 'text', value: ' baz'}
    ]);
  });
});
