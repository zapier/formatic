/*global describe, it, expect*/
'use strict';

describe('util', function() {

  var formatic = require('../');

  var util = formatic.plugin('util');

  it('should see an empty string as a blank', function () {

    expect(util.isBlank('')).toEqual(true);
  });

  it('should see a non-empty string as not blank', function () {

    expect(util.isBlank('foo')).toEqual(false);
  });

  it('should see a null as a blank', function () {

    expect(util.isBlank(null)).toEqual(true);
  });

  it('should see undefined as a blank', function () {

    expect(util.isBlank(undefined)).toEqual(true);
  });

  it('should set prop in obj', function () {

    var obj = {foo: 'bar'};

    util.setIn(obj, 'foo', 'baz');

    expect(obj.foo).toEqual('baz');
  });

  it('should parse blank text', function () {

    expect(util.parseTextWithTags('')).toEqual([]);
  });

  it('should parse plain text', function () {

    expect(util.parseTextWithTags('foo')).toEqual([{type: 'text', value: 'foo'}]);
  });

  it('should parse text with tag in middle', function () {

    expect(util.parseTextWithTags('foo {{bar}} baz')).toEqual([
      {type: 'text', value: 'foo '},
      {type: 'tag', value: 'bar'},
      {type: 'text', value: ' baz'}
    ]);
  });

  it('should parse text with tag at front', function () {

    expect(util.parseTextWithTags('{{bar}} baz')).toEqual([
      {type: 'tag', value: 'bar'},
      {type: 'text', value: ' baz'}
    ]);
  });

  it('should parse text with tag at back', function () {

    expect(util.parseTextWithTags('{{bar}} baz')).toEqual([
      {type: 'tag', value: 'bar'},
      {type: 'text', value: ' baz'}
    ]);
  });

  it('should parse text with tags with extra braces', function () {
    expect(util.parseTextWithTags('foo {{{bar}} baz')).toEqual([
      {type: 'text', value: 'foo {'},
      {type: 'tag', value: 'bar'},
      {type: 'text', value: ' baz'}
    ]);
  });
});
