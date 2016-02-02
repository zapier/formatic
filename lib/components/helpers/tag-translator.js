'use strict';
var _ = require('../../undash');

const buildChoicesMap = (replaceChoices) => {
  var choices = {};
  replaceChoices.forEach(function (choice) {
    var key = choice.value;
    choices[key] = choice.label;
  });
  return choices;
};

const getTagPositions = (text) => {
  var lines = text.split('\n');
  var re = /\{\{.+?\}\}/g;
  var positions = [];
  var m;

  for(var i = 0; i < lines.length; i++) {
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

const tokenize = (text) => {
  text = String(text);
  if (text === '') {
    return [];
  }

  var regexp = /(\{\{|\}\})/;
  var parts = text.split(regexp);

  var tokens = [];
  var inTag = false;
  parts.forEach(function (part) {
    if (part === '{{') {
      inTag = true;
    } else if (part === '}}') {
      inTag = false;
    } else if (inTag) {
      tokens.push({type: 'tag', value: part});
    } else {
      tokens.push({type: 'string', value: part});
    }
  });
  return tokens;
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
const getTrueTagPosition = (text, cmPos) => {
  const positions = getTagPositions(text);
  return _.find(positions, p => cmPos.line === p.line && cmPos.ch >= p.start && cmPos.ch <= p.stop);
};

/*
   Creates helper to translate between tags like {{firstName}} and
   an encoded representation suitable for use in CodeMirror.
 */
const TagTranslator = (replaceChoices, humanize) => {
  // Map of tag to label 'firstName' --> 'First Name'
  var choices = buildChoicesMap(replaceChoices);

  return {
    /*
       Get label for tag.  For example 'firstName' becomes 'First Name'.
       Returns a humanized version of the tag if we don't have a label for the tag.
     */
    getLabel: (tag) => {
      var label = choices[tag];
      if (!label) {
        // If tag not found and we have a humanize function, humanize the tag.
        // Otherwise just return the tag.
        label = humanize && humanize(tag) || tag;
      }
      return label;
    },

    getTagPositions,
    tokenize,
    getTrueTagPosition
  };
};

module.exports = TagTranslator;
