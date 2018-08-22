// # pretty-select-value component

/*
   Render a select dropdown for a list of choices. Choices values can be of any
   type. Does not use native select dropdown. Choices can optionally include
   'sample' property displayed grayed out.
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _undash = require('../../undash');

var _undash2 = _interopRequireDefault(_undash);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _utils = require('../../utils');

var _helper = require('../../mixins/helper');

var _helper2 = _interopRequireDefault(_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _createReactClass2.default)({

  displayName: 'SelectValue',

  mixins: [_helper2.default],

  onChange: function onChange(event) {
    var choiceValue = event.target.value;
    var choiceType = choiceValue.substring(0, choiceValue.indexOf(':'));
    if (choiceType === 'choice') {
      var choiceIndex = choiceValue.substring(choiceValue.indexOf(':') + 1);
      choiceIndex = parseInt(choiceIndex);
      this.props.onChange(this.props.choices[choiceIndex].value);
    }
  },

  onChangeCustomValue: function onChangeCustomValue(newValue, info) {
    this.props.onChange(newValue, {
      field: info.field,
      isCustomValue: true
    });
  },

  // Intercept custom value field events and pretend like this field sent them.
  onCustomAction: function onCustomAction(info) {
    info = _undash2.default.extend({}, info, { field: this.props.field, isCustomValue: true });
    this.props.onAction(info);
  },

  getDefaultProps: function getDefaultProps() {
    return {
      choices: []
    };
  },

  getInitialState: function getInitialState() {
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

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    var currentChoice = this.currentChoice(newProps);
    this.setState({
      currentChoice: currentChoice
    });
  },
  onKeyDown: function onKeyDown(event) {
    if (!this.isReadOnly()) {
      if (event.keyCode === _utils.keyCodes.ESC) {
        event.preventDefault();
        event.stopPropagation();
        if (this.state.isChoicesOpen) {
          this.onToggleChoices();
          this.onFocus();
        }
      } else if (!this.state.isChoicesOpen) {
        if (!this.state.isEnteringCustomValue) {
          if (event.keyCode === _utils.keyCodes.UP || event.keyCode === _utils.keyCodes.DOWN || event.keyCode === _utils.keyCodes.ENTER) {
            event.preventDefault();
            event.stopPropagation();
            this.onToggleChoices();
          }
        }
      } else {
        if (this.choicesRef && this.choicesRef.onKeyDown) {
          this.choicesRef.onKeyDown(event);
        }
      }
    }
  },


  value: function value(props) {
    props = props || this.props;
    return props.field.value !== undefined ? props.field.value : '';
  },

  onFocus: function onFocus() {
    (0, _utils.focusRefNode)(this.containerRef);
  },


  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var _props = this.props,
        config = _props.config,
        field = _props.field;

    var choices = config.normalizePrettyChoices(this.props.choices);
    var choicesOrLoading;

    if (choices.length > 1 && choices[0].value === '///loading///' || config.fieldIsLoading(field)) {
      choices = [{ value: '///loading///' }];
    }

    var choicesElem = void 0;
    if (!this.isReadOnly()) {
      choicesElem = config.createElement('choices', {
        ref: (0, _utils.ref)(this, 'choices'),
        choices: choices,
        open: this.state.isChoicesOpen,
        ignoreCloseNodes: this.getCloseIgnoreNodes,
        onSelect: this.onSelectChoice,
        onClose: this.onCloseChoices,
        onChoiceAction: this.onChoiceAction,
        field: field,
        isAccordion: field.isAccordion,
        isAccordionAlwaysCollapsable: field.isAccordionAlwaysCollapsable,
        hoverIndex: this.state.hoverIndex,
        onFocusSelect: this.onFocus
      });
    }

    var inputElem = this.getInputElement();

    var customFieldElement = null;
    if (this.state.isEnteringCustomValue && this.hasCustomField()) {
      var customFieldTemplate = config.fieldCustomFieldTemplate(field);
      var customField = _undash2.default.extend({ type: 'PrettyText' }, {
        key: field.key, parent: field, fieldIndex: field.fieldIndex,
        rawFieldTemplate: customFieldTemplate,
        value: field.value
      }, customFieldTemplate);
      config.initField(customField);
      customFieldElement = config.createFieldElement({
        field: customField,
        onChange: this.onChangeCustomValue, onAction: this.onCustomAction,
        ref: (0, _utils.ref)(this, 'customFieldInput')
      });
    }

    var selectArrow = void 0;
    if (!this.isReadOnly() || this.hasReadOnlyControls()) {
      selectArrow = _react2.default.createElement('span', { className: (0, _classnames2.default)('select-arrow', { 'readonly-control': this.isReadOnly() }) });
    }

    choicesOrLoading = _react2.default.createElement(
      'div',
      { ref: (0, _utils.ref)(this, 'container'), tabIndex: '0', onKeyDown: this.onKeyDown, className: (0, _classnames2.default)(_undash2.default.extend({}, this.props.classes, { 'choices-open': this.state.isChoicesOpen })),
        onChange: this.onChange },
      _react2.default.createElement(
        'div',
        { ref: (0, _utils.ref)(this, 'toggle'), onClick: this.isReadOnly() ? null : this.onToggleChoices },
        inputElem,
        selectArrow
      ),
      choicesElem,
      _react2.default.createElement(
        'span',
        null,
        customFieldElement
      )
    );

    return choicesOrLoading;
  },

  getInputElement: function getInputElement() {
    return this.props.config.createElement('pretty-select-input', {
      field: this.props.field,
      ref: (0, _utils.ref)(this, 'customInput'),
      isEnteringCustomValue: this.state.isEnteringCustomValue && !this.hasCustomField(),
      onChange: this.onInputChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlur,
      onAction: this.onBubbleAction,
      getDisplayValue: this.getDisplayValue
    });
  },

  blurLater: function blurLater() {
    var self = this;
    setTimeout(function () {
      self.onBlurAction();
    }, 0);
  },

  onBlur: function onBlur() {
    if (!this.state.isChoicesOpen) {
      this.blurLater();
    }
  },

  getCloseIgnoreNodes: function getCloseIgnoreNodes() {
    return this.toggleRef;
  },

  onToggleChoices: function onToggleChoices() {
    this.setChoicesOpen(!this.state.isChoicesOpen);
  },

  setChoicesOpen: function setChoicesOpen(isOpen) {
    var action = isOpen ? 'open-choices' : 'close-choices';
    this.onStartAction(action);
    this.setState({ isChoicesOpen: isOpen });
  },

  onSelectChoice: function onSelectChoice(value) {
    this.onStartAction('exit-custom-value');
    this.setState({
      isEnteringCustomValue: false,
      isChoicesOpen: false
    });
    this.props.onChange(value);
    this.blurLater();
  },

  onCloseChoices: function onCloseChoices() {
    if (this.state.isChoicesOpen) {
      this.blurLater();
      this.setChoicesOpen(false);
    }
  },

  currentChoice: function currentChoice(props) {
    props = props || this.props;
    var _props2 = props,
        config = _props2.config,
        field = _props2.field,
        choices = _props2.choices;

    var currentValue = this.value(props);
    var currentChoice = config.fieldSelectedChoice(field);
    // Make sure selectedChoice is a match for current value.
    if (currentChoice && currentChoice.value !== currentValue) {
      currentChoice = null;
    }
    if (!currentChoice) {
      currentChoice = _undash2.default.find(choices, function (choice) {
        return !choice.action && choice.value === currentValue;
      });
    }
    return currentChoice;
  },

  getDisplayValue: function getDisplayValue() {
    var currentChoice = this.state.currentChoice;
    //var currentChoice = this.currentChoice();

    var currentValue = this.value();
    var isDefaultValue = currentValue === this.props.config.fieldTemplateDefaultValue(this.props.field);

    if (this.state.isEnteringCustomValue || !isDefaultValue && !currentChoice && currentValue) {
      if (this.hasCustomField()) {
        var choices = this.props.choices;

        var customChoice = _undash2.default.find(choices, function (choice) {
          return choice.action === 'enter-custom-value';
        });
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

  hasCustomField: function hasCustomField() {
    return !!this.props.config.fieldCustomFieldTemplate(this.props.field);
  },


  onChoiceAction: function onChoiceAction(choice) {
    if (choice.action === 'enter-custom-value') {
      this.setState({
        isEnteringCustomValue: true,
        isChoicesOpen: false
      }, function () {
        if (this.hasCustomField()) {
          if (this.customFieldInputRef && this.customFieldInputRef.focus) {
            this.customFieldInputRef.focus();
          }
        } else {
          if (this.customInputRef && this.customInputRef.focus) {
            this.customInputRef.focus();
          }
        }
      });
    } else if (choice.action === 'insert-field') {
      this.setState({
        isChoicesOpen: false
      }, function () {
        this.customInputRef.setChoicesOpen(true);
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

  onInputChange: function onInputChange(value) {
    this.props.onChange(value);
  }
});