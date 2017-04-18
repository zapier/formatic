import React from 'react';
import _ from 'lodash';

const customPlugin = (config) => {
  var initField = config.initField;
  var createElement_PrettyTag = config.createElement_PrettyTag;

  config.createElement_PrettyTag = function (props, children) {
    var tag = props.tag;
    var choice = _.find(props.replaceChoices, function(c) { return c.value === tag; });
    var classes = choice && choice.tagClasses || {};
    var newProps = _.extend({}, props, {classes: classes});

    return createElement_PrettyTag(newProps, children);
  };

  return {
    createElement_ChoiceActionSample() {
      return (
        <span>X</span>
      );
    },

    initField(field) {
      initField(field);

      if (field.id === 'silly') {
        if ((field.parent.value.name || '').toLowerCase() === 'joe') {
          field.help_text_html = field.meta.msg;
        }
      }
    },

    isRemovalOfLastArrayItemAllowed() {
      return false;
    },

    isRemovalOfLastAssocListItemAllowed() {
      return false;
    }
  };
};

export default customPlugin;
