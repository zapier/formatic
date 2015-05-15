// # select component

/*
Render select element to give a user choices for the value of a field. Renders non-native
select drop down and supports fancier renderings.
*/

'use strict';

var React = require('react/addons');

var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'PrettySelect',

  mixins: [require('../../mixins/field')],

  getInitialState: function () {
    return {
      choices: this.props.config.fieldPrettyChoices(this.props.field),
      isEnteringCustomValue: false
    };
  },

  componentWillReceiveProps: function (newProps) {
    this.setState({
      choices: newProps.config.fieldPrettyChoices(newProps.field)
    });
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    }, this.createContentElement());
  },

  createContentElement: function () {
    var config = this.props.config;
    var field = this.props.field;

    if (this.state.isEnteringCustomValue) {
      // TODO make me a helper (or reuse single line string)
      return <input ref="customInput" type="text" className={cx(this.props.classes)} value={field.value}
                    onChange={this.onChange} onFocus={this.onFocusAtion} onBlur={this.onBlurAction} />;

    }

    return config.createElement('pretty-select-value', {
      choices: this.state.choices, field: field, onChange: this.onChangeValue, onAction: this.onAction
    });
  },

  onAction: function (params) {
    if (params.action === 'enter-custom-value') {
      this.setState({isEnteringCustomValue: true}, function () {
        this.refs.customInput.getDOMNode().focus();
      });
    }
    this.onBubbleAction(params);
  },

  onChange: function (event) {
    this.onChangeValue(event.target.value);
  }
});
