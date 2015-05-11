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
      value: defaultValue
    };
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var choices = this.props.config.normalizePrettyChoices(this.props.choices);
    var choicesOrLoading;

    if (choices.length === 1 && choices[0].value === '///loading///') {
      choicesOrLoading = <div>'Loading choices...'</div>;
    } else {
      var choicesElem = this.props.config.createElement('choices', {
        ref: 'choices',
        choices: choices,
        open: this.state.isChoicesOpen,
        ignoreCloseNodes: this.getCloseIgnoreNodes,
        onSelect: this.onSelectChoice,
        onClose: this.onCloseChoices
      });

      choicesOrLoading = (
        <div className={cx(this.props.classes)}
             onChange={this.onChange}
             onFocus={this.onFocusAction}
             onBlur={this.onBlurAction}>

          <div ref="toggle" onClick={this.onToggleChoices}>
            <input value={this.getDisplayValue()} readOnly />
            <span className="select-arrow" />
          </div>
          {choicesElem}
        </div>
      );
    }

    return choicesOrLoading;
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
    return currentChoice ? currentChoice.label : '';
  }
});
