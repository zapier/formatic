'use strict';
/* global describe it expect */

var TagTranslator = require('../../../lib/components/helpers/tag-translator');

describe('editor-util', function () {
  var choices = [
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' }
  ];

  var translator = TagTranslator(choices);

  var tagged = 'hello {{firstName}} {{lastName}}';
  var encoded = 'hello \ue000 \ue001';
  var html = 'hello <span class="pretty-part">First Name</span> <span class="pretty-part">Last Name</span>';

  it('should encode tagged values', function () {
    var actual = translator.encodeValue(tagged);
    expect(actual).toEqual(encoded);
  });

  it('should decode encoded values', function () {
    var actual = translator.decodeValue(encoded);
    expect(actual).toEqual(tagged);
  });

  it('should convert tagged values to HTML', function () {
    var actual = translator.toHtml(tagged);
    expect(actual).toEqual(html);
  });

});
