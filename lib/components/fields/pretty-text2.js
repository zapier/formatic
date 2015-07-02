'use strict';
/*eslint no-script-url:0 */

var React = require('react/addons');
var TagTranslator = require('../helpers/tag-translator');
var _ = require('../../undash');
var cx = require('classnames');

/*
   Wraps a PrettyTextHelper to provide insert fields.
 */
module.exports = React.createClass({

  displayName: 'PrettyText',

  mixins: [require('../../mixins/field')],

  getInitialState: function() {
    var selectedChoices = this.props.config.fieldSelectedReplaceChoices(this.props.field);
    var replaceChoices = this.props.config.fieldReplaceChoices(this.props.field);
    var translator = TagTranslator(selectedChoices.concat(replaceChoices), this.props.config.humanize);

    return {
      value: this.props.field.value,
      isChoicesOpen: false,
      isEditable: false,
      replaceChoices: replaceChoices,
      translator: translator
    };
  },

  componentWillReceiveProps: function(nextProps) {
    var selectedChoices = this.props.config.fieldSelectedReplaceChoices(this.props.field);
    var replaceChoices = this.props.config.fieldReplaceChoices(nextProps.field);
    var nextState = {
      replaceChoices: replaceChoices,
      translator: TagTranslator(selectedChoices.concat(replaceChoices), this.props.config.humanize)
    };

    if (this.state.value !== nextProps.field.value && nextProps.field.value) {
      nextState.value = nextProps.field.value;
    }

    this.setState(nextState);
  },

  handleChoiceSelection: function (key) {
    var pos = this.state.selectedTagPos;
    var tag = '{{' + key + '}}';

    this.refs.textBox.insertText(tag, pos);
    this.setState({ isChoicesOpen: false, selectedTagPos: null });
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;
    var props = { field: field, plain: this.props.plain };
    var tabIndex = field.tabIndex;

    var onInsertClick = function () {
      this.setState({selectedTagPos: null});
      this.onToggleChoices();
    };
    var insertBtn = config.createElement('insert-button',
                                         {ref: 'toggle', onClick: onInsertClick.bind(this)},
                                         'Insert...');

    var choices = config.createElement('choices', {
      ref: 'choices',
      choices: this.state.replaceChoices,
      open: this.state.isChoicesOpen,
      ignoreCloseNodes: this.getCloseIgnoreNodes,
      onSelect: this.handleChoiceSelection,
      onClose: this.onCloseChoices,
      isAccordion: this.props.field.isAccordion
    });

    var prettyTextHelper = config.createElement('pretty-text-helper', {
      classes: this.props.classes,
      tabIndex: tabIndex,
      onChange: this.onChangeValue,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction,
      value: this.props.field.value,
      selectedChoices: this.props.config.fieldSelectedReplaceChoices(this.props.field),
      replaceChoices: this.state.replaceChoices,
      onTagClick: this.onTagClick,
      ref: 'textBox',
      isEditable: this.state.isEditable
    });

    // Render read-only version.
    var element = (
      <div className={cx({'pretty-text-wrapper': true, 'choices-open': this.state.isChoicesOpen})} onMouseEnter={this.switchToEditable}>
        {prettyTextHelper}
        {insertBtn}
        {choices}
      </div>
    );

    return config.createElement('field', props, element);
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

  onCloseChoices: function () {
    if (this.state.isChoicesOpen) {
      this.setChoicesOpen(false);
    }
  },

  switchToEditable: function () {
    if (!this.state.isEditable) {
      this.setState({isEditable: true});
    }
  },

  onTagClick: function(pos) {
    this.setState({selectedTagPos: pos});
    this.onToggleChoices();
  }
});
