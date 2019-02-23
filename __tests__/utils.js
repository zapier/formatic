/*global describe, it, expect*/
'use strict';

import utils, { argumentsToArray } from '@/src/utils';

describe('utils', function() {
  it('should deep copy primitives', function() {
    const name = 'Joe';

    const copy = utils.deepCopy(name);

    expect(copy).toEqual('Joe');
  });

  it('should deep copy array', function() {
    const array = [
      {
        x: 1,
      },
    ];

    const copy = utils.deepCopy(array);

    copy[0].x = 2;

    expect(array[0].x).toEqual(1);
  });

  it('should deep copy object', function() {
    const obj = {
      name: {
        first: 'Joe',
        last: 'Foo',
      },
    };

    const copy = utils.deepCopy(obj);

    copy.name.last = 'Bar';

    expect(obj.name.last).toEqual('Foo');
  });

  it('should convert blank to pascal case', function() {
    expect(utils.dashToPascal('')).toEqual('');
  });

  it('should convert dashes to pascal case', function() {
    expect(utils.dashToPascal('foo-bar')).toEqual('FooBar');
  });

  it('should convert pascal case to pascal case', function() {
    expect(utils.dashToPascal('FooBar')).toEqual('FooBar');
  });

  it('should convert camel case to pascal case', function() {
    expect(utils.dashToPascal('fooBar')).toEqual('FooBar');
  });

  it('should delegate a method', function() {
    const dog = {
      bark: function() {
        return 'woof';
      },
      speak: utils.delegateTo('bark'),
    };

    expect(dog.bark()).toEqual(dog.speak());
  });

  it('should create a delegator', function() {
    const dog = {
      bark: function() {
        return 'woof';
      },
    };

    const delegateTo = utils.delegator(dog);

    dog.speak = delegateTo('bark');

    expect(dog.bark()).toEqual(dog.speak());
  });

  it('should convert arguments to an array', () => {
    function someFunction() {
      expect(argumentsToArray(arguments)).toEqual(['a', 'b', 'c']);
      expect(argumentsToArray(arguments, 1)).toEqual(['b', 'c']);
      expect(argumentsToArray(arguments, 1, ['x'])).toEqual(['x', 'b', 'c']);
    }

    function someFunctionWithLessArgs() {
      expect(argumentsToArray(arguments)).toEqual([]);
      expect(argumentsToArray(arguments, 1)).toEqual([]);
      expect(argumentsToArray(arguments, 1, ['x'])).toEqual(['x']);
    }

    someFunction('a', 'b', 'c');
    someFunctionWithLessArgs();
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
