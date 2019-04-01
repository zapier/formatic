'use strict';

/*eslint no-script-url:0 */

import createReactClass from 'create-react-class';

import FieldMixin from '@/src/mixins/field';

/*
   Wraps a PrettyTextInput to be a stand alone field.
 */
export default createReactClass({
  displayName: 'PrettyText',

  mixins: [FieldMixin],

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const config = this.props.config;
    const field = this.props.field;
    const props = { typeName: 'PrettyText', field, plain: this.props.plain };

    const readOnly = config.fieldIsReadOnly(field);

    // The tab index makes this control focusable and editable. If read only, no tabIndex
    const tabIndex = readOnly ? null : field.tabIndex;

    const element = config.createElement('pretty-text-input', {
      typeName: 'PrettyText',
      ariaLabel: this.props.ariaLabel,
      classes: this.props.classes,
      tabIndex,
      onChange: this.onChangeValue,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction,
      onAction: this.onBubbleAction,
      field: this.props.field,
      value: this.props.field.value,
      isAccordion: this.props.field.isAccordion,
      selectedChoices: this.props.config.fieldSelectedReplaceChoices(
        this.props.field
      ),
      replaceChoices: this.props.config.fieldReplaceChoices(this.props.field),
      readOnly,
    });

    return config.createElement('field', props, element);
  },
});
