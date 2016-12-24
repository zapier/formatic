'use strict';
/* global describe it expect */

var TagTranslator = require('../../../lib/components/helpers/tag-translator');
const Formatic = require('../../../lib/formatic');

describe('editor-util', function () {
  var replaceChoices = [
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' }
  ];
  var humanize = function (s) { return s.toUpperCase(); };
  var translator = TagTranslator(replaceChoices, humanize);

  it('should get labels', function () {
    expect(translator.getLabel('firstName')).toBe('First Name');
    expect(translator.getLabel('lastName')).toBe('Last Name');
  });

  it('should humanize missing labels', function () {
    expect(translator.getLabel('shouting')).toBe('SHOUTING');
  });

  it('should tokenize tagged text', function () {
    var tagged = 'Hi there {{lastName}}, {{firstName}}.';

    const config = Formatic.createConfig();

    expect(config.tokenize(tagged)).toEqual([
      {type: 'string', value: 'Hi there '},
      {type: 'tag', value: 'lastName'},
      {type: 'string', value: ', '},
      {type: 'tag', value: 'firstName'},
      {type: 'string', value: '.'}
    ]);
  });

  it('should get tag start and stop positions', function () {
    //         '0123456789012345678901234567890123456789 01234567890123456789012345'
    var text = 'Here there {{lastName}}, {{firstName}}.\nHow are you {{firstName}}?';
    var positions = translator.getTagPositions(text);

    expect(positions).toEqual([
      {line: 0, start: 11, stop: 23, tag: 'lastName'},
      {line: 0, start: 25, stop: 38, tag: 'firstName'},
      {line: 1, start: 12, stop: 25, tag: 'firstName'}
    ]);
  });

  it('should find tag at position', () => {
    const text = 'Here there {{lastName}}, {{firstName}}.\nHow are you {{firstName}}?';

    expect(translator.getTrueTagPosition(text, {line: 0, ch: 11})).toEqual({
      line: 0, start: 11, stop: 23, tag: 'lastName'
    });

    expect(translator.getTrueTagPosition(text, {line: 0, ch: 12})).toEqual({
      line: 0, start: 11, stop: 23, tag: 'lastName'
    });

    expect(translator.getTrueTagPosition(text, {line: 0, ch: 23})).toEqual({
      line: 0, start: 11, stop: 23, tag: 'lastName'
    });

    expect(translator.getTrueTagPosition(text, {line: 0, ch: 24})).toBeUndefined();
  });
});
