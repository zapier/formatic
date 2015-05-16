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
    var config = this.props.config;
    var choices = this.props.config.normalizePrettyChoices(this.props.choices);
    var choicesOrLoading;

    if (choices.length === 1 && choices[0].value === '///loading///') {
      choicesOrLoading = config.createElement('loading-choices', {});
    } else {
      var choicesElem = this.props.config.createElement('choices', {
        ref: 'choices',
        choices: choices,
        open: this.state.isChoicesOpen,
        ignoreCloseNodes: this.getCloseIgnoreNodes,
        onSelect: this.onSelectChoice,
        onClose: this.onCloseChoices,
        onChoiceAction: this.onChoiceAction
      });

      var inputElem = this.getInputElement();

      choicesOrLoading = (
        <div className={cx(this.props.classes)}
             onChange={this.onChange}
             onFocus={this.onFocusAction}
             onBlur={this.onBlurAction}>

          <div ref="toggle" onClick={this.onToggleChoices}>
            {inputElem}
            <span className="select-arrow" />
          </div>
          {choicesElem}
        </div>
      );
    }

    return choicesOrLoading;
  },

  getInputElement: function () {
    if (this.state.isEnteringCustomValue) {
      return <input ref="customInput" type="text" value={this.props.field.value}
                    onChange={this.onInputChange} onFocus={this.onFocusAction} onBlur={this.onBlurAction} />;
    }

    return <input type="text" value={this.getDisplayValue()} readOnly />;
  },

  getCloseIgnoreNodes: function () {
    return this.refs.toggle.getDOMNode();
  },

  onToggleChoices: function () {
    this.setChoicesOpen(!this.state.isChoicesOpen);
  },

  setChoicesOpen: function (isOpen) {
    var action = isOpen ? 'open-replacements' : 'close-replacements';
    this.onStartAction(action);
    this.setState({ isChoicesOpen: isOpen });
  },

  onSelectChoice: function (value) {
    this.setState({
      isChoicesOpen: false,
      value: value
    });
    this.props.onChange(value);
  },

  onCloseChoices: function () {
    if (this.state.isChoicesOpen) {
      this.setChoicesOpen(false);
    }
  },

  getDisplayValue: function () {
    var currentValue = this.state.value;
    var currentChoice = _.find(this.props.choices, function (choice) {
      return choice.value === currentValue;
    });

    if (currentChoice) {
      return currentChoice.label;
    } else if (currentValue) { // custom value
      return currentValue;
    }
    return '';
  },

  onChoiceAction: function (choice) {
    if (choice.action === 'enter-custom-value') {
      this.setState({
        isEnteringCustomValue: true,
        isChoicesOpen: false,
        value: choice.value
      }, function () {
        this.refs.customInput.getDOMNode().focus();
      });
    } else {
      this.setState({
        isChoicesOpen: false,
        value: choice.value
      });
    }

    this.onStartAction(choice.action, choice);
  },

  onAction: function (params) {
    if (params.action === 'enter-custom-value') {
      this.setState({isEnteringCustomValue: true}, function () {
        this.refs.customInput.getDOMNode().focus();
      });
    }
    this.onBubbleAction(params);
  },

  onInputChange: function (event) {
    this.props.onChange(event.target.value);
  }
});
