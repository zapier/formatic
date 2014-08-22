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

  it('should make an object hookable', function () {

    var obj = {};

    utils.hookable(obj);

    obj.method('greet', function () {
      return 'Hello';
    });

    obj.wrap('greet', function (next) {
      return next().toUpperCase();
    });

    obj.wrap('greet', function (next) {
      return next() + ', Bob!';
    });

    expect(obj.greet()).toEqual('HELLO, BOB!');

    obj.replaceMethod('greet', function () {
      return 'Hola';
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

  it('should convert ascii text to hidden unicode and back', function () {

    var hidden = utils.hideUnicodeMessage('foobar');
    var original = utils.unhideUnicodeMessage(hidden);

    expect(original).toEqual('foobar');
  });

  it('should convert unicode text to hidden unicode and back', function () {

    var hidden = utils.hideUnicodeMessage('€');
    var original = utils.unhideUnicodeMessage(hidden);

    expect(original).toEqual('€');
  });

  // it('should diff same', function () {
  //
  //   expect(utils.diff('foo', 'foo')).toEqual(null);
  // });
  //
  // it('should diff front insert', function () {
  //
  //   expect(utils.diff('bar', 'foobar')).toEqual({
  //     insert: 'foo',
  //     delete: '',
  //     pos: 0
  //   });
  // });
  //
  // it('should diff back insert', function () {
  //
  //   expect(utils.diff('foo', 'foobar')).toEqual({
  //     insert: 'bar',
  //     delete: '',
  //     pos: 3
  //   });
  // });
  //
  // it('should diff front delete', function () {
  //
  //   expect(utils.diff('foobar', 'bar')).toEqual({
  //     insert: '',
  //     delete: 'foo',
  //     pos: 0
  //   });
  // });
  //
  // it('should diff back delete', function () {
  //
  //   expect(utils.diff('foobar', 'foo')).toEqual({
  //     insert: '',
  //     delete: 'bar',
  //     pos: 3
  //   });
  // });
  //
  // it('should diff middle insert', function () {
  //
  //   expect(utils.diff('foobaz', 'foobarbaz')).toEqual({
  //     insert: 'bar',
  //     delete: '',
  //     pos: 3
  //   });
  // });
  //
  // it('should diff middle delete', function () {
  //
  //   expect(utils.diff('foobarbaz', 'foobaz')).toEqual({
  //     insert: '',
  //     delete: 'bar',
  //     pos: 3
  //   });
  // });
  //
  // it('should char diff', function () {
  //
  //   expect(utils.charDiff('foobar', 'foocar')).toEqual(3);
  //
  //   expect(utils.charDiff('foobar', 'feebar', -1)).toEqual(3);
  // });
});
