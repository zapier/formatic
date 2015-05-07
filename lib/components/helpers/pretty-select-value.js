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

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var choices = this.props.choices || [];

    var choicesOrLoading;

    if (choices.length === 1 && choices[0].value === '///loading///') {
      choicesOrLoading = <div>'Loading choices...'</div>;
    } else {
      var value = this.props.field.value !== undefined ? this.props.field.value : '';

      choices = choices.map(function (choice, i) {
        return {
          choiceValue: 'choice:' + i,
          value: choice.value,
          label: choice.label
        };
      });

      var valueChoice = _.find(choices, function (choice) {
        return choice.value === value;
      });

      if (valueChoice === undefined) {

        var label = value;
        if (!_.isString(value)) {
          label = JSON.stringify(value);
        }
        valueChoice = {
          choiceValue: 'value:',
          value: value,
          label: label
        };
        choices = [valueChoice].concat(choices);
      }

      var options = choices.map(function (choice, i) {
        return (
          <option key={i} value={choice.choiceValue}>
            {choice.label}
          </option>
        );
      });

      choicesOrLoading = (
        <select
          className={cx(this.props.classes)}
          onChange={this.onChange}
          value={valueChoice.choiceValue}
          onFocus={this.onFocusAction}
          onBlur={this.onBlurAction}>
          {options}
        </select>
      );
    }

    return choicesOrLoading;
  }
});
