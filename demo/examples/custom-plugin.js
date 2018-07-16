import React from 'react';
import _ from 'lodash';

const customPlugin = config => {
  const initField = config.initField;
  const createElement_PrettyTag = config.createElement_PrettyTag;

  config.createElement_PrettyTag = function(props, children) {
    const tag = props.tag;
    const choice = _.find(props.replaceChoices, function(c) {
      return c.value === tag;
    });
    const classes = (choice && choice.tagClasses) || {};
    const newProps = _.extend({}, props, { classes });

    return createElement_PrettyTag(newProps, children);
  };

  return {
    createElement_ChoiceActionSample() {
      return <span>X</span>;
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
    },
  };
};

export default customPlugin;
