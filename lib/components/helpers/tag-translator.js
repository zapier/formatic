'use strict';

// Constant for first unused special use character.
// See IMPLEMENTATION NOTE in pretty-text2.js.
var FIRST_SPECIAL_CHAR = 0xe000;

// regexp used to grep out tags like {{firstName}}
var TAGS_REGEXP = /\{\{(.+?)\}\}/g;

/*
   Creates helper to translate between tags like {{firstName}} and
   an encoded representation suitable for use in CodeMirror.

   See IMPLEMENTATION NOTE in pretty-text2.js.
*/
function TagTranslator(choices) {
  // To help translate to and from the CM representation with the special
  // characters, build two maps:
  //   - charToTagMap: special char to tag - i.e. { '\ue000': 'firstName' }
  //   - tagToCharMap: tag to special char, i.e. { firstName: '\ue000' }
  var charToTagMap = {};
  var tagToCharMap = {};

  var charCode = FIRST_SPECIAL_CHAR;
  Object.keys(choices).forEach(function (tag) {
    var char = String.fromCharCode(charCode++);
    charToTagMap[char] = tag;
    tagToCharMap[tag] = char;
  });

  return {
    specialCharsRegexp: /[\ue000-\uefff]/g,

    /*
       Convert tag to encoded character. For example
       'firstName' becomes '\ue000'.
     */
    encodeTag: function (tag) {
      return tagToCharMap[tag];
    },

    /*
      Convert text value to encoded value for CodeMirror. For example
      'hello {{firstName}}' becomes 'hello \ue000'
    */
    encodeValue: function (value) {
      return value.replace(TAGS_REGEXP, function (m, tag) {
        return tagToCharMap[tag];
      });
    },

    /*
      Convert encoded text used in CM to tagged text. For example
      'hello \ue000' becomes 'hello {{firstName}}'
    */
    decodeValue: function (encodedValue) {
      return encodedValue.replace(this.specialCharsRegexp, function (c) {
          var tag = charToTagMap[c];
          return '{{' + tag + '}}';
      });
    },

    /*
       Convert encoded character to label. For example
       '\ue000' becomes 'Last Name'.
    */
    decodeChar: function (char) {
      var tag = charToTagMap[char];
      return choices[tag];
    },

    /*
      Convert tagged value to HTML. For example
      'hello {{firstName}}' becomes 'hello <span class="tag">First Name</span>'
    */
    toHtml: function (value) {
      return value.replace(TAGS_REGEXP, function (m, mustache) {
        var tag = mustache.replace('{{', '').replace('}}', '');
        var label = choices[tag];
        return '<span class="pretty-part">' + label + '</span>';
      });
    }
  };
}

module.exports = TagTranslator;
