'use strict';
/*eslint no-script-url:0 */

var React = require('react/addons');
var _ = require('../../undash');
var cx = require('classnames');

/*
   Wraps a PrettyTextHelper to be a stand alone field.
 */
module.exports = React.createClass({

  displayName: 'PrettyText',

  mixins: [require('../../mixins/field')],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;
    var props = { field: field, plain: this.props.plain };
    var tabIndex = field.tabIndex;

    var element = config.createElement('pretty-text-helper', {
      classes: this.props.classes,
      tabIndex: tabIndex,
      onChange: this.onChangeValue,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction,
      onStartAction: this.onStartAction,
      value: this.props.field.value,
      isAccordion: this.props.field.isAccordion,
      selectedChoices: this.props.config.fieldSelectedReplaceChoices(this.props.field),
      replaceChoices: this.props.config.fieldReplaceChoices(this.props.field),
      ref: 'textBox'
    });

    return config.createElement('field', props, element);
  } });