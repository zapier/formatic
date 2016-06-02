// # pretty-select-value component

/*
   Render a select dropdown for a list of choices. Choices values can be of any
   type. Does not use native select dropdown. Choices can optionally include
   'sample' property displayed grayed out.
 */

'use strict';

var React = require('react');
var _ = require('../../undash');
var cx = require('classnames');

var { keyCodes, focusRefNode } = require('../../utils');

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

  onChangeCustomValue: function (newValue, info) {
    this.props.onChange(newValue, {
      field: info.field,
      isCustomValue: true
    });
  },

  // Intercept custom value field events and pretend like this field sent them.
  onCustomAction: function (info) {
    info = _.extend({}, info, {field: this.props.field, isCustomValue: true});
    this.props.onAction(info);
  },

  getDefaultProps: function () {
    return {
      choices: []
    };
  },

  getInitialState: function() {
    var currentChoice = this.currentChoice(this.props);
    var isDefaultValue = this.props.field.value === this.props.config.fieldTemplateDefaultValue(this.props.field);
    return {
      isChoicesOpen: this.props.isChoicesOpen,
      isEnteringCustomValue: !isDefaultValue && !currentChoice && this.props.field.value,
      // Caching this cause it's kind of expensive.
      currentChoice: this.currentChoice(this.props),
      hoverIndex: -1
    };
  },

  componentWillReceiveProps(newProps) {
    var currentChoice = this.currentChoice(newProps);
    this.setState({
      currentChoice
    });
  },

  onKeyDown(event) {
    if (!this.isReadOnly()) {
      if (event.keyCode === keyCodes.ESC) {
        event.preventDefault();
        event.stopPropagation();
        if (this.state.isChoicesOpen) {
          this.onToggleChoices();
          this.onFocus();
        }
      } else if (!this.state.isChoicesOpen) {
        if (!this.state.isEnteringCustomValue) {
          if (event.keyCode === keyCodes.UP || event.keyCode === keyCodes.DOWN || event.keyCode === keyCodes.ENTER) {
            event.preventDefault();
            event.stopPropagation();
            this.onToggleChoices();
          }
        }
      } else {
        if (this.refs.choices && this.refs.choices.onKeyDown) {
          this.refs.choices.onKeyDown(event);
        }
      }
    }
  },

  value: function (props) {
    props = props || this.props;
    return props.field.value !== undefined ? props.field.value : '';
  },

  onFocus() {
    focusRefNode(this.refs.container);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    const {config, field} = this.props;
    var choices = config.normalizePrettyChoices(this.props.choices);
    var choicesOrLoading;

    if ((choices.length > 1 && choices[0].value === '///loading///') || config.fieldIsLoading(field)) {
      choices = [{value: '///loading///'}];
    }

    let choicesElem;
    if (!this.isReadOnly()) {
      choicesElem = config.createElement('choices', {
        ref: 'choices',
        choices: choices,
        open: this.state.isChoicesOpen,
        ignoreCloseNodes: this.getCloseIgnoreNodes,
        onSelect: this.onSelectChoice,
        onClose: this.onCloseChoices,
        onChoiceAction: this.onChoiceAction,
        field,
        isAccordion: field.isAccordion,
        hoverIndex: this.state.hoverIndex,
        onFocusSelect: this.onFocus
      });
    }

    var inputElem = this.getInputElement();

    let customFieldElement = null;
    if (this.state.isEnteringCustomValue && this.hasCustomField()) {
      const customFieldTemplate = config.fieldCustomFieldTemplate(field);
      const customField = _.extend({type: 'PrettyText'}, {
        key: field.key, parent: field, fieldIndex: field.fieldIndex,
        rawFieldTemplate: customFieldTemplate,
        value: field.value
      }, customFieldTemplate);
      config.initField(customField);
      customFieldElement = config.createFieldElement({
        field: customField,
        onChange: this.onChangeCustomValue, onAction: this.onCustomAction,
        ref: 'customFieldInput'
      });
    }

    let selectArrow;
    if (!this.isReadOnly() || this.hasReadOnlyControls()) {
      selectArrow = <span className={cx('select-arrow', {'readonly-control': this.isReadOnly()})} />;
    }

    choicesOrLoading = (
      <div ref="container" tabIndex="0" onKeyDown={this.onKeyDown} className={cx(_.extend({}, this.props.classes, {'choices-open': this.state.isChoicesOpen}))}
           onChange={this.onChange}>
        <div ref="toggle" onClick={this.isReadOnly() ? null : this.onToggleChoices}>
          {inputElem}
          {selectArrow}
        </div>
        {choicesElem}
        <span>
        {customFieldElement}
        </span>
      </div>
    );

    return choicesOrLoading;
  },

  getInputElement: function () {
    return this.props.config.createElement('pretty-select-input', {
      field: this.props.field,
      ref: 'customInput',
      isEnteringCustomValue: this.state.isEnteringCustomValue && !this.hasCustomField(),
      onChange: this.onInputChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlur,
      onAction: this.onBubbleAction,
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
    return this.refs.toggle;
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
    this.onStartAction('exit-custom-value');
    this.setState({
      isEnteringCustomValue: false,
      isChoicesOpen: false
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

  currentChoice: function (props) {
    props = props || this.props;
    var {config, field, choices} = props;
    var currentValue = this.value(props);
    var currentChoice = config.fieldSelectedChoice(field);
    // Make sure selectedChoice is a match for current value.
    if (currentChoice && currentChoice.value !== currentValue) {
      currentChoice = null;
    }
    if (!currentChoice) {
      currentChoice = _.find(choices, function (choice) {
        return !choice.action && choice.value === currentValue;
      });
    }
    return currentChoice;
  },

  getDisplayValue: function () {
    var {currentChoice} = this.state;
    //var currentChoice = this.currentChoice();
    var currentValue = this.value();
    var isDefaultValue = currentValue === this.props.config.fieldTemplateDefaultValue(this.props.field);

    if (this.state.isEnteringCustomValue || (!isDefaultValue && !currentChoice && currentValue)) {
      if (this.hasCustomField()) {
        const {choices} = this.props;
        const customChoice = _.find(choices, choice => choice.action === 'enter-custom-value');
        if (customChoice && customChoice.label) {
          return customChoice.label;
        }
      }
      return currentValue;
    }

    if (currentChoice) {
      return currentChoice.label;
    }

    // If this is the default value, and we have no choice to use for the label, just use the value.
    if (isDefaultValue) {
      return currentValue;
    }

    return '';
  },

  hasCustomField() {
    return !!this.props.config.fieldCustomFieldTemplate(this.props.field);
  },

  onChoiceAction: function (choice) {
    if (choice.action === 'enter-custom-value') {
      this.setState({
        isEnteringCustomValue: true,
        isChoicesOpen: false
      }, function () {
        if (this.hasCustomField()) {
          if (this.refs.customFieldInput && this.refs.customFieldInput.focus) {
            this.refs.customFieldInput.focus();
          }
        } else {
          if (this.refs.customInput && this.refs.customInput.focus) {
            this.refs.customInput.focus();
          }
        }
      });
    } else if (choice.action === 'insert-field') {
      this.setState({
        isChoicesOpen: false
      }, function () {
        this.refs.customInput.setChoicesOpen(true);
      });
    } else {
      if (choice.action === 'clear-current-choice') {
        this.onStartAction('exit-custom-value');
        this.setState({
          isChoicesOpen: false,
          isEnteringCustomValue: false
        });
        this.props.onChange('');
      } else {
        this.setState({
          isChoicesOpen: !!choice.isOpen
        });
      }
    }

    this.onStartAction(choice.action, choice);
  },

  onInputChange: function (value) {
    this.props.onChange(value);
  }
});
