'use strict';
import _ from '@/src/undash';

const buildChoicesMap = replaceChoices => {
  const choices = {};
  replaceChoices.forEach(function(choice) {
    const key = choice.value;
    choices[key] = choice.tagLabel || choice.label;
  });
  return choices;
};

const getTagPositions = text => {
  const lines = text.split('\n');
  const re = /\{\{.+?\}\}/g;
  const positions = [];
  let m;

  for (let i = 0; i < lines.length; i++) {
    while ((m = re.exec(lines[i])) !== null) {
      const tag = m[0].substring(2, m[0].length - 2);
      positions.push({
        line: i,
        start: m.index,
        stop: m.index + m[0].length,
        tag,
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
const getTrueTagPosition = (text, cmPos) => {
  const positions = getTagPositions(text);
  return _.find(
    positions,
    p => cmPos.line === p.line && cmPos.ch >= p.start && cmPos.ch <= p.stop
  );
};

/*
   Creates helper to translate between tags like {{firstName}} and
   an encoded representation suitable for use in CodeMirror.
 */
const TagTranslator = (replaceChoices, humanize) => {
  // Map of tag to label 'firstName' --> 'First Name'
  const choices = buildChoicesMap(replaceChoices);

  return {
    /*
       Get label for tag.  For example 'firstName' becomes 'First Name'.
       Returns a humanized version of the tag if we don't have a label for the tag.
     */
    getLabel: tag => {
      let label = choices[tag];
      if (!label) {
        // If tag not found and we have a humanize function, humanize the tag.
        // Otherwise just return the tag.
        label = (humanize && humanize(tag)) || tag;
      }
      return label;
    },

    getTagPositions,
    getTrueTagPosition,
  };
};

export default TagTranslator;
