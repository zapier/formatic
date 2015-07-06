// # pretty-select-value component

/*
   Render a select dropdown for a list of choices. Choices values can be of any
   type. Does not use native select dropdown. Choices can optionally include
   'sample' property displayed grayed out.
 */

'use strict';

var React = require('react/addons');
var _ = require('underscore');
var cx = require('classnames');

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
    var defaultValue = this.props.field.value !== undefined ? this.props.field.value : '';

    return {
      isChoicesOpen: this.props.isChoicesOpen,
      value: defaultValue,
      isEnteringCustomValue: false
    };
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var choices = this.props.config.normalizePrettyChoices(this.props.choices);
    var choicesOrLoading;

    if ((choices.length > 1 && choices[0].value === '///loading///') || this.props.config.fieldIsLoading(this.props.field)) {
      choices = [{value: '///loading///'}];
    }
    var choicesElem = this.props.config.createElement('choices', {
      ref: 'choices',
      choices: choices,
      open: this.state.isChoicesOpen,
      ignoreCloseNodes: this.getCloseIgnoreNodes,
      onSelect: this.onSelectChoice,
      onClose: this.onCloseChoices,
      onChoiceAction: this.onChoiceAction,
      field: this.props.field
    });

    var inputElem = this.getInputElement();

    choicesOrLoading = (
      <div className={cx(_.extend({}, this.props.classes, {'choices-open': this.state.isChoicesOpen}))}
           onChange={this.onChange}>

        <div ref="toggle" onClick={this.onToggleChoices}>
          {inputElem}
          <span className="select-arrow" />
        </div>
        {choicesElem}
      </div>
    );

    return choicesOrLoading;
  },

  getInputElement: function () {
    return this.props.config.createElement('pretty-select-input', {
      field: this.props.field,
      ref: 'customInput',
      isEnteringCustomValue: this.state.isEnteringCustomValue,
      onChange: this.onInputChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlur,
      getDisplayValue: this.getDisplayValue
    });
  },

  blurLater: function () {
    var self = this;
    setTimeout(function () {
      self.onBlurAction();
    }, 0);
  },

  onBlur: function () {
    if (!this.state.isChoicesOpen) {
      this.blurLater();
    }
  },

  getCloseIgnoreNodes: function () {
    return this.refs.toggle.getDOMNode();
  },

  onToggleChoices: function () {
    this.setChoicesOpen(!this.state.isChoicesOpen);
  },

  setChoicesOpen: function (isOpen) {
    var action = isOpen ? 'open-choices' : 'close-choices';
    this.onStartAction(action);
    this.setState({ isChoicesOpen: isOpen });
  },

  onSelectChoice: function (value) {
    this.setState({
      isEnteringCustomValue: false,
      isChoicesOpen: false,
      value: value
    });
    this.props.onChange(value);
    this.blurLater();
  },

  onCloseChoices: function () {
    if (this.state.isChoicesOpen) {
      this.blurLater();
      this.setChoicesOpen(false);
    }
  },

  getDisplayValue: function () {
    var config = this.props.config;
    var currentValue = this.state.value;
    var currentChoice = this.props.config.fieldSelectedChoice(this.props.field);
    // Make sure selectedChoice is a match for current value.
    if (currentChoice && currentChoice.value !== currentValue) {
      currentChoice = null;
    }
    if (!currentChoice) {
      currentChoice = _.find(this.props.choices, function (choice) {
        return !choice.action && choice.value === currentValue;
      });
    }

    if (currentChoice) {
      return currentChoice.label;
    } else if (currentValue) { // custom value
      return currentValue;
    }
    return config.fieldPlaceholder(this.props.field) || '';
  },

  onChoiceAction: function (choice) {
    if (choice.action === 'enter-custom-value') {
      this.setState({
        isEnteringCustomValue: true,
        isChoicesOpen: false,
        value: choice.value
      }, function () {
        this.refs.customInput.focus();
      });
    } else if (choice.action === 'insert-field') {
      this.setState({
        isChoicesOpen: false
      }, function () {
        this.refs.customInput.setChoicesOpen(true);
      });
    } else {
      this.setState({
        isChoicesOpen: !!choice.isOpen
      });
      if (choice.action === 'clear-current-choice') {
        this.setState({
          value: ''
        });
        this.props.onChange('');
      }
    }

    this.onStartAction(choice.action, choice);
  },

  // Is this even used? I don't think so.
  onAction: function (params) {
    if (params.action === 'enter-custom-value') {
      this.setState({isEnteringCustomValue: true}, function () {
        this.refs.customInput.focus();
      });
    }
    this.onBubbleAction(params);
  },

  onInputChange: function (value) {
    this.props.onChange(value);
    this.setState({
      value: value
    });
  }
});
