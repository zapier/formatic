'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _undash = require('../../undash');

var _undash2 = _interopRequireDefault(_undash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var buildChoicesMap = function buildChoicesMap(replaceChoices) {
  var choices = {};
  replaceChoices.forEach(function (choice) {
    var key = choice.value;
    choices[key] = choice.tagLabel || choice.label;
  });
  return choices;
};

var getTagPositions = function getTagPositions(text) {
  var lines = text.split('\n');
  var re = /\{\{.+?\}\}/g;
  var positions = [];
  var m;

  for (var i = 0; i < lines.length; i++) {
    while ((m = re.exec(lines[i])) !== null) {
      var tag = m[0].substring(2, m[0].length - 2);
      positions.push({
        line: i,
        start: m.index,
        stop: m.index + m[0].length,
        tag: tag
      });
    }
  }
  return positions;
};

/*
   Given a CodeMirror document position like {line: 0, ch: 10}, return
   the tag position object for that position, for example {line: 0,
   start: 8, stop: 12}

   When clicking on a pretty tag, CodeMirror .getCursor() may return
   either the position of the start or the end of the tag, so we use
   this function to normalize it.

   Clicking on a pretty tag is jumpy - the cursor goes from one end to
   the other each time you click it. We should probably fix that, and
   the need for this function might go away.
*/
var getTrueTagPosition = function getTrueTagPosition(text, cmPos) {
  var positions = getTagPositions(text);
  return _undash2.default.find(positions, function (p) {
    return cmPos.line === p.line && cmPos.ch >= p.start && cmPos.ch <= p.stop;
  });
};

/*
   Creates helper to translate between tags like {{firstName}} and
   an encoded representation suitable for use in CodeMirror.
 */
var TagTranslator = function TagTranslator(replaceChoices, humanize) {
  // Map of tag to label 'firstName' --> 'First Name'
  var choices = buildChoicesMap(replaceChoices);

  return {
    /*
       Get label for tag.  For example 'firstName' becomes 'First Name'.
       Returns a humanized version of the tag if we don't have a label for the tag.
     */
    getLabel: function getLabel(tag) {
      var label = choices[tag];
      if (!label) {
        // If tag not found and we have a humanize function, humanize the tag.
        // Otherwise just return the tag.
        label = humanize && humanize(tag) || tag;
      }
      return label;
    },

    getTagPositions: getTagPositions,
    getTrueTagPosition: getTrueTagPosition
  };
};

exports.default = TagTranslator;