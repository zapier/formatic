// # pretty-select-value component

/*
   Render a select dropdown for a list of choices. Choices values can be of any
   type. Does not use native select dropdown. Choices can optionally include
   'sample' property displayed grayed out.
 */

'use strict';

var React = require('react/addons');
var _ = require('underscore');
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'SelectValue',

  mixins: [require('../../mixins/helper')],

  onChange: function (event) {
    var choiceValue = event.target.value;
    var choiceType = choiceValue.substring(0, choiceValue.indexOf(':'));
    if (choiceType === 'choice') {
      var choiceIndex = choiceValue.substring(choiceValue.indexOf(':') + 1);
      choiceIndex = parseInt(choiceIndex);
      this.props.onChange(this.props.choices[choiceIndex].value);
    }
  },

  getDefaultProps: function () {
    return {
      choices: []
    };
  },

  getInitialState: function() {
    var defaultValue = this.props.field.defaultValue !== undefined ? this.props.field.defaultValue : '';

    return {
      isChoicesOpen: this.props.isChoicesOpen,
      value: defaultValue
    };
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var choices = this.props.choices.map(function (choice) {
      if (choice.sample === undefined) {
        choice.sample = choice.label;
      }
    });

    var choicesOrLoading;

    if (choices.length === 1 && choices[0].value === '///loading///') {
      choicesOrLoading = <div>'Loading choices...'</div>;
    } else {
      var choicesElem = this.props.config.createElement('choices', {
        ref: 'choices',
        choices: this.props.choices,
        open: this.state.isChoicesOpen,
        onSelect: this.onSelectChoice,
        onClose: this.onCloseChoices
      });

      choicesOrLoading = (
        <div className={cx(this.props.classes)}
             onChange={this.onChange}
             onFocus={this.onFocusAction}
             onBlur={this.onBlurAction}>
          <input value={this.getDisplayValue()} disabled onClick={this.onClickInput} />
          {choicesElem}
        </div>
      );
    }

    return choicesOrLoading;
  },

  onClickInput: function () {
    this.setState({isChoicesOpen: !this.state.isChoicesOpen});
  },

  onSelectChoice: function (value) {
    this.setState({
      isChoicesOpen: false,
      value: value
    });
    this.props.onChange(value);
  },

  onCloseChoices: function () {
    this.setState({isChoicesOpen: false});
  },

  getDisplayValue: function () {
    var currentValue = this.state.value;
    var currentChoice = _.find(this.props.choices, function (choice) {
      return choice.value === currentValue;
    });
    return currentChoice ? currentChoice.label : '';
  }
});
