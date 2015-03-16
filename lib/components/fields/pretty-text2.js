'use strict';
/* global CodeMirror */
/*eslint no-script-url:0 */

var React = require('react/addons');
var TagTranslator = require('../helpers/tag-translator');
var _ = require('underscore');

/*
   Editor for tagged text. Renders text like "hello {{firstName}}"
   with replacement labels rendered in a pill box. Designed to load
   quickly when many separate instances of it are on the same
   page.

   Uses CodeMirror to edit text. To save memory the CodeMirror node is
   instantiated when the user moves the mouse into the edit area.
   Initially a read-only view using a simple div is shown.

   IMPLEMENTATION NOTE:

   To display the tags inside CodeMirror we are using CM's
   specialCharPlaceholder feature, to replace special characters with
   custom DOM nodes. This feature is designed for single character
   replacements, not tags like 'firstName'.  So we replace each tag
   with an unused character from the Unicode private use area, and
   tell CM to replace that with a DOM node display the tag label with
   the pill box effect.

   Is this evil? Perhaps a little, but delete, undo, redo, cut, copy
   and paste of the tag pill boxes just work because CM treats them as
   atomic single characters, and it's not much code on our part.
 */
module.exports = React.createClass({
  displayName: 'PrettyText',

  mixins: [require('../../mixins/field')],

  componentDidMount: function() {
    this.createEditor();
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return (nextState.value !== this.state.value) ||
           (nextState.codeMirrorMode && !this.state.codeMirrorMode) ||
           !_.isEqual(nextProps.field.replaceChoices, this.props.field.replaceChoices);
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (prevState.codeMirrorMode !== this.state.codeMirrorMode) {
      // Changed from code mirror mode to read only mode or vice versa,
      // so setup the other editor.
      this.createEditor();
    }

    // If they just typed in a tag like {{firstName}} we have to replace it
    if (this.state.codeMirrorMode && this.codeMirror.getValue().match(/\{\{.+\}\}/)) {
      // avoid recursive update cycle
      this.updatingCodeMirror = true;

      // get new encoded value for CodeMirror
      var cmValue = this.codeMirror.getValue();
      var decodedValue = this.translator.decodeValue(cmValue);
      var encodedValue = this.translator.encodeValue(decodedValue);

      // Grab the cursor so we can reset it.
      // The new length of the CM value will be shorter after replacing a tag like {{firstName}}
      // with a single special char, so adjust cursor position accordingly.
      var cursor = this.codeMirror.getCursor();
      cursor.ch -= cmValue.length - encodedValue.length;

      this.codeMirror.setValue(encodedValue);
      this.codeMirror.setCursor(cursor);
    }
  },

  componentWillUnmount: function() {
    this.removeCodeMirrorEditor();
  },

  getInitialState: function() {
    // TODO: using instance vars like this is probaby bad. Find another approach.
    this.tagToLabelMap = this.buildTagToLabelMap();
    this.translator = TagTranslator(this.tagToLabelMap, this.props.config.humanize);

    return {
      value: this.props.field.value,
      codeMirrorMode: false
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (this.state.value !== nextProps.field.value && nextProps.field.value) {
      this.setState({ value: nextProps.field.value });
    }
  },

  buildTagToLabelMap: function () {
    var map = {};
    this.props.config.fieldReplaceChoices(this.props.field).map(function (choice) {
      map[choice.value] = choice.label;
    });
    return map;
  },

  handleChoiceSelection: function (key) {
    var char = this.translator.encodeTag(key);

    // put the cursor at the end of the inserted tag.
    this.codeMirror.replaceSelection(char, 'end');
    this.codeMirror.focus();
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;
    var props = { field: field, plain: this.props.plain };
    var tabIndex = field.tabIndex;
    var textBox = this.createTextBoxNode();

    var choices = config.createElement('choices', {
      ref: 'choices',
      choices: this.props.field.replaceChoices, open: this.state.isChoicesOpen
      // onSelect: this.onInsert, onClose: this.onCloseChoices, ignoreCloseNodes: this.getCloseIgnoreNodes
    });

    // Render read-only version. We are using pure HTML via dangerouslySetInnerHTML, to avoid
    // the cost of the react nodes. This is probably a premature optimization.
    var element = (
      <div onMouseEnter={this.switchToCodeMirror}>
        <div className="pretty-text-box form-control" tabIndex={tabIndex}>
          {textBox}
        </div>

        <a href="Javascript:" onClick={this.onToggleChoices}>Insert...</a>
        {choices}
      </div>
    );

    return config.createElement('field', props, element);
  },

  onToggleChoices: function () {
    this.setChoicesOpen(!this.state.isChoicesOpen);
  },

  setChoicesOpen: function (isOpen) {
    var action = isOpen ? 'open-replacements' : 'close-replacements';
    this.onStartAction(action);
    this.setState({ isChoicesOpen: isOpen });
  },

  createTextBoxNode: function () {
    if (this.state.codeMirrorMode) {
      return <div ref="textBox" />;
    } else {
      var html = this.translator.toHtml(this.state.value);
      return <div ref="textBox" dangerouslySetInnerHTML={{__html: html}} />;
    }
  },

  createEditor: function () {
    if (this.state.codeMirrorMode) {
      this.createCodeMirrorEditor();
    } else {
      this.createReadonlyEditor();
    }
  },

  createCodeMirrorEditor: function () {
    var cmValue = this.translator.encodeValue(this.state.value);

    var options = {
      tabindex: this.props.tabIndex,
      value: cmValue,
      specialChars: this.translator.specialCharsRegexp,
      specialCharPlaceholder: this.createTagNode,
      extraKeys: {
        Tab: false
      }
    };

    var textBox = this.refs.textBox.getDOMNode();
    textBox.innerHTML = ''; // release any previous read-only content so it can be GC'ed

    this.codeMirror = CodeMirror(textBox, options);
    this.codeMirror.on('change', this.onCodeMirrorChange);
  },

  onCodeMirrorChange: function () {
    if (this.updatingCodeMirror) {
      // avoid recursive update cycle, and mark the code mirror manual update as done
      this.updatingCodeMirror = false;
      return;
    }

    var newValue = this.translator.decodeValue(this.codeMirror.getValue());
    this.onChangeValue(newValue);
    this.setState({value: newValue});
  },

  createReadonlyEditor: function () {
    var textBoxNode = this.refs.textBox.getDOMNode();
    textBoxNode.innerHTML = this.translator.toHtml(this.state.value);
  },

  removeCodeMirrorEditor: function () {
    var textBoxNode = this.refs.textBox.getDOMNode();
    var cmNode = textBoxNode.firstChild;
    textBoxNode.removeChild(cmNode);
    this.codeMirror = null;
  },

  switchToCodeMirror: function () {
    if (!this.state.codeMirrorMode) {
      this.setState({codeMirrorMode: true});
    }
  },

  // Create pill box style for display inside CM. For example
  // '\ue000' becomes '<span class="tag>First Name</span>'
  createTagNode: function (char) {
    var node = document.createElement('span');
    var label = this.translator.decodeChar(char);
    React.render(
      <span className="pretty-part" onClick={this.displayChoicesDropdown}>{label}</span>,
      node
    );
    return node;
  }
});
