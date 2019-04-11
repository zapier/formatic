// # pretty-select-value component

/*
   Render a select dropdown for a list of choices. Choices values can be of any
   type. Does not use native select dropdown. Choices can optionally include
   'sample' property displayed grayed out.
 */

'use strict';

import createReactClass from 'create-react-class';
import _ from '@/src/undash';
import cx from 'classnames';

import { focusRefNode, keyCodes, ref } from '@/src/utils';
import HelperMixin from '@/src/mixins/helper';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'SelectValue',

  mixins: [HelperMixin],

  onChange: function(event) {
    const choiceValue = event.target.value;
    const choiceType = choiceValue.substring(0, choiceValue.indexOf(':'));
    if (choiceType === 'choice') {
      let choiceIndex = choiceValue.substring(choiceValue.indexOf(':') + 1);
      choiceIndex = parseInt(choiceIndex);
      this.props.onChange(this.props.choices[choiceIndex].value);
    }
  },

  onChangeCustomValue: function(newValue, info) {
    this.props.onChange(newValue, {
      field: info.field,
      isCustomValue: true,
    });
  },

  // Intercept custom value field events and pretend like this field sent them.
  onCustomAction: function(info) {
    info = _.extend({}, info, { field: this.props.field, isCustomValue: true });
    this.props.onAction(info);
  },

  getDefaultProps: function() {
    return {
      choices: [],
    };
  },

  getInitialState: function() {
    const currentChoice = this.currentChoice(this.props);
    const isDefaultValue =
      this.props.field.value ===
      this.props.config.fieldTemplateDefaultValue(this.props.field);
    return {
      isChoicesOpen: this.props.isChoicesOpen,
      isEnteringCustomValue:
        !isDefaultValue && !currentChoice && this.props.field.value,
      // Caching this cause it's kind of expensive.
      currentChoice: this.currentChoice(this.props),
      hoverIndex: -1,
    };
  },

  componentWillReceiveProps(newProps) {
    const currentChoice = this.currentChoice(newProps);
    this.setState({
      currentChoice,
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
          if (
            event.keyCode === keyCodes.UP ||
            event.keyCode === keyCodes.DOWN ||
            event.keyCode === keyCodes.ENTER
          ) {
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

  value: function(props) {
    props = props || this.props;
    return props.field.value !== undefined ? props.field.value : '';
  },

  onFocus() {
    focusRefNode(this.containerRef);
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const { config, field } = this.props;
    let choices = config.normalizePrettyChoices(this.props.choices);

    if (
      (choices.length > 1 && choices[0].value === '///loading///') ||
      config.fieldIsLoading(field)
    ) {
      choices = [{ value: '///loading///' }];
    }

    let choicesElem;
    if (!this.isReadOnly()) {
      choicesElem = config.createElement('choices', {
        typeName: this.props.typeName,
        ref: ref(this, 'choices'),
        choices,
        open: this.state.isChoicesOpen,
        ignoreCloseNodes: this.getCloseIgnoreNodes,
        onSelect: this.onSelectChoice,
        onClose: this.onCloseChoices,
        onChoiceAction: this.onChoiceAction,
        field,
        isAccordion: field.isAccordion,
        isAccordionAlwaysCollapsable: field.isAccordionAlwaysCollapsable,
        hoverIndex: this.state.hoverIndex,
        onFocusSelect: this.onFocus,
      });
    }

    const inputElem = this.getInputElement();

    let customFieldElement = null;
    if (this.state.isEnteringCustomValue && this.hasCustomField()) {
      const customFieldTemplate = this.getCustomField();
      const customField = _.extend(
        { type: 'PrettyText' },
        {
          key: field.key,
          parent: field,
          fieldIndex: field.fieldIndex,
          rawFieldTemplate: customFieldTemplate,
          value: field.value,
        },
        customFieldTemplate
      );
      config.initField(customField);
      customFieldElement = config.createFieldElement({
        field: customField,
        onChange: this.onChangeCustomValue,
        onAction: this.onCustomAction,
        ref: ref(this, 'customFieldInput'),
      });
    }

    let selectArrow;
    if (!this.isReadOnly() || this.hasReadOnlyControls()) {
      selectArrow = (
        <span
          className={cx('select-arrow', {
            'readonly-control': this.isReadOnly(),
          })}
          renderWith={this.renderWith('SelectArrow', {
            isOpen: this.state.isChoicesOpen,
          })}
        />
      );
    }

    const choicesOrLoading = (
      <div
        className={cx(
          _.extend({}, this.props.classes, {
            'choices-open': this.state.isChoicesOpen,
          })
        )}
        onChange={this.onChange}
        onKeyDown={this.onKeyDown}
        ref={ref(this, 'container')}
        renderWith={this.renderWith('ChoicesWrapper')}
        role="listbox"
        tabIndex="0"
      >
        {/* Keyboard handler is on wrapping element. */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
        <div
          onClick={this.isReadOnly() ? null : this.onToggleChoices}
          ref={ref(this, 'toggle')}
          renderWith={this.renderWith('ChoicesInputWrapper')}
        >
          {inputElem}
          {selectArrow}
        </div>
        {choicesElem}
        <span renderWith={this.renderWith('CustomValueWrapper')}>
          {customFieldElement}
        </span>
      </div>
    );

    return choicesOrLoading;
  },

  getInputElement: function() {
    return this.props.config.createElement('pretty-select-input', {
      typeName: this.props.typeName,
      field: this.props.field,
      id: this.props.id,
      ref: ref(this, 'customInput'),
      isEnteringCustomValue:
        this.state.isEnteringCustomValue && !this.hasCustomField(),
      onChange: this.onInputChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlur,
      onAction: this.onBubbleAction,
      getDisplayValue: this.getDisplayValue,
    });
  },

  blurLater: function() {
    const self = this;
    setTimeout(function() {
      self.onBlurAction();
    }, 0);
  },

  onBlur: function() {
    if (!this.state.isChoicesOpen) {
      this.blurLater();
    }
  },

  getCloseIgnoreNodes: function() {
    return this.toggleRef;
  },

  onToggleChoices: function() {
    this.setChoicesOpen(!this.state.isChoicesOpen);
  },

  setChoicesOpen: function(isOpen) {
    const action = isOpen ? 'open-choices' : 'close-choices';
    this.onStartAction(action);
    this.setState({ isChoicesOpen: isOpen });
  },

  onSelectChoice: function(value) {
    this.onStartAction('exit-custom-value');
    this.setState({
      isEnteringCustomValue: false,
      isChoicesOpen: false,
    });
    this.props.onChange(value);
    this.blurLater();
  },

  onCloseChoices: function() {
    if (this.state.isChoicesOpen) {
      this.blurLater();
      this.setChoicesOpen(false);
    }
  },

  currentChoice: function(props) {
    props = props || this.props;
    const { config, field, choices } = props;
    const currentValue = this.value(props);
    let currentChoice = config.fieldSelectedChoice(field);
    // Make sure selectedChoice is a match for current value.
    if (currentChoice && currentChoice.value !== currentValue) {
      currentChoice = null;
    }
    if (!currentChoice) {
      currentChoice = _.find(choices, function(choice) {
        return !choice.action && choice.value === currentValue;
      });
    }
    return currentChoice;
  },

  getDisplayValue: function() {
    const { currentChoice } = this.state;
    //var currentChoice = this.currentChoice();
    const currentValue = this.value();
    const isDefaultValue =
      currentValue ===
      this.props.config.fieldTemplateDefaultValue(this.props.field);

    if (
      this.state.isEnteringCustomValue ||
      (!isDefaultValue && !currentChoice && currentValue)
    ) {
      if (this.hasCustomField()) {
        const { choices, config } = this.props;
        const customChoice = _.find(
          choices,
          choice => choice.action === 'enter-custom-value'
        );
        return (
          config.customChoiceDisplayValue(customChoice, currentValue) ||
          currentValue
        );
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
    // Supporting custom values without a separate custom field is no longer supported.
    return true;
  },

  getCustomField() {
    const { config, field } = this.props;
    return (
      config.fieldCustomFieldTemplate(field) || {
        label: `Custom Value`,
        helpText: null,
        required: config.fieldIsRequired(field),
      }
    );
  },

  onChoiceAction: function(choice) {
    if (choice.action === 'enter-custom-value') {
      this.setState(
        {
          isEnteringCustomValue: true,
          isChoicesOpen: false,
        },
        function() {
          if (this.hasCustomField()) {
            if (this.customFieldInputRef && this.customFieldInputRef.focus) {
              this.customFieldInputRef.focus();
            }
          } else {
            if (this.customInputRef && this.customInputRef.focus) {
              this.customInputRef.focus();
            }
          }
        }
      );
    } else if (choice.action === 'insert-field') {
      this.setState(
        {
          isChoicesOpen: false,
        },
        function() {
          this.customInputRef.setChoicesOpen(true);
        }
      );
    } else {
      if (choice.action === 'clear-current-choice') {
        this.onStartAction('exit-custom-value');
        this.setState({
          isChoicesOpen: false,
          isEnteringCustomValue: false,
        });
        this.props.onChange('');
      } else {
        this.setState({
          isChoicesOpen: !!choice.isOpen,
        });
      }
    }

    this.onStartAction(choice.action, choice);
  },

  onInputChange: function(value) {
    this.props.onChange(value);
  },
});
