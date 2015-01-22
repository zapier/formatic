/*global describe, it, expect*/
'use strict';

describe('utils', function() {

  var utils = require('../lib/utils');

  it('should deep copy primitives', function () {

    var name = 'Joe';

    var copy = utils.deepCopy(name);

    expect(copy).toEqual('Joe');
  });

  it('should deep copy array', function () {

    var array = [
      {
        x: 1
      }
    ];

    var copy = utils.deepCopy(array);

    copy[0].x = 2;

    expect(array[0].x).toEqual(1);
  });

  it('should deep copy object', function () {

    var obj = {
      name: {
        first: 'Joe',
        last: 'Foo'
      }
    };

    var copy = utils.deepCopy(obj);

    copy.name.last = 'Bar';

    expect(obj.name.last).toEqual('Foo');
  });

  it('should convert blank to pascal case', function () {

    expect(utils.dashToPascal('')).toEqual('');
  });

  it('should convert dashes to pascal case', function () {

    expect(utils.dashToPascal('foo-bar')).toEqual('FooBar');
  });

  it('should convert pascal case to pascal case', function () {

    expect(utils.dashToPascal('FooBar')).toEqual('FooBar');
  });

  it('should convert camel case to pascal case', function () {

    expect(utils.dashToPascal('fooBar')).toEqual('FooBar');
  });

  it('should delegate a method', function () {

    var dog = {
      bark: function () {
        return 'woof';
      },
      speak: utils.delegateTo('bark')
    };

    expect(dog.bark()).toEqual(dog.speak());
  });

  // May pull parsing back out of pretty-text component in the future, so
  // leaving this here for now.

  // it('should parse blank text', function () {
  //
  //   expect(util.parseTextWithTags('')).toEqual([]);
  // });
  //
  // it('should parse plain text', function () {
  //
  //   expect(util.parseTextWithTags('foo')).toEqual([{type: 'text', value: 'foo'}]);
  // });
  //
  // it('should parse text with tag in middle', function () {
  //
  //   expect(util.parseTextWithTags('foo {{bar}} baz')).toEqual([
  //     {type: 'text', value: 'foo '},
  //     {type: 'tag', value: 'bar'},
  //     {type: 'text', value: ' baz'}
  //   ]);
  // });
  //
  // it('should parse text with tag at front', function () {
  //
  //   expect(util.parseTextWithTags('{{bar}} baz')).toEqual([
  //     {type: 'tag', value: 'bar'},
  //     {type: 'text', value: ' baz'}
  //   ]);
  // });
  //
  // it('should parse text with tag at back', function () {
  //
  //   expect(util.parseTextWithTags('{{bar}} baz')).toEqual([
  //     {type: 'tag', value: 'bar'},
  //     {type: 'text', value: ' baz'}
  //   ]);
  // });
  //
  // it('should parse text with tags with extra braces', function () {
  //   expect(util.parseTextWithTags('foo {{{bar}} baz')).toEqual([
  //     {type: 'text', value: 'foo {'},
  //     {type: 'tag', value: 'bar'},
  //     {type: 'text', value: ' baz'}
  //   ]);
  // });
});
