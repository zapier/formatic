'use strict';

/*eslint no-script-url:0 */

import React from 'react';

import FieldMixin from '../../mixins/field';

/*
   Wraps a PrettyTextInput to be a stand alone field.
 */
export default React.createClass({

  displayName: 'PrettyText',

  mixins: [FieldMixin],

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;
    var props = { field: field, plain: this.props.plain };

    const readOnly = config.fieldIsReadOnly(field);

    // The tab index makes this control focusable and editable. If read only, no tabIndex
    var tabIndex = readOnly ? null : field.tabIndex;

    var element = config.createElement('pretty-text-input', {
      classes: this.props.classes,
      tabIndex: tabIndex,
      onChange: this.onChangeValue,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction,
      onAction: this.onBubbleAction,
      field: this.props.field,
      value: this.props.field.value,
      isAccordion: this.props.field.isAccordion,
      shouldOpenChoicesOnFocus: this.props.field.shouldOpenChoicesOnFocus,
      selectedChoices: this.props.config.fieldSelectedReplaceChoices(this.props.field),
      replaceChoices: this.props.config.fieldReplaceChoices(this.props.field),
      ref: 'textBox',
      readOnly: readOnly
    });

    return config.createElement('field', props, element);
  }
});
