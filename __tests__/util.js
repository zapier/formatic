/*global describe, it, expect*/
'use strict';

describe('util', function() {

  var formatic = require('../');

  var util = formatic.plugin('util');

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
