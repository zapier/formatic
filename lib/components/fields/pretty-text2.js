'use strict';
/* global CodeMirror */

var React = require('react/addons');
var TagTranslator = require('./tag-translator');
var ChoicesDropdown = require('./choices-dropdown');

/*
   Editor for tagged text. Renders text like "hello {{firstName}}"
   with replacement labels rendered in a pill box. TaggedTextEditor is
   designed to work efficiently when many separate instances of it are
   on the same page.

   Uses CodeMirror to edit text. To save memory the CodeMirror node is
   instantiated when the user moves the mouse into the edit area.
   When the mouse leaves the node is replaced with a less expensive,
   read-only rendering that does not use CodeMirror.

   Properties:
   - value: the inital text value, defaults to ''
   - newValue callback when value is changed (TODO: this is very hacky)

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

  propTypes: {
    initialValue: React.PropTypes.string
  },

  getDefaultProps: function() {
    return { initialValue: '' };
  },

  componentDidMount: function() {
    this.createEditor();
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (prevState.codeMirrorMode !== this.state.codeMirrorMode) {
      // Changed from code mirror mode to read only mode or vice versa,
      // so setup the other editor.
      this.createEditor();
    }
  },

  componentWillUnmount: function() {
    this.removeCodeMirrorEditor();
  },

  getInitialState: function() {
    this.tagToLabelMap = this.buildTagToLabelMap();
    this.translator = TagTranslator(this.tagToLabelMap);

    return {
      value: this.props.field.initialValue,
      codeMirrorMode: false
    };
  },

  buildTagToLabelMap: function () {
    var map = {};
    this.props.field.replaceChoices.map(function (choice) {
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
    var choices = this.tagToLabelMap;

    var textBox = this.createTextBoxNode();

    // Render read-only version. We are using pure HTML via dangerouslySetInnerHTML, to avoid
    // the cost of the react nodes. This is probably a premature optimization.
    var element = (
      <div onMouseEnter={this.switchToCodeMirror}>
        <div className="pretty-text-box form-control" tabIndex={this.props.tabIndex}>
          {textBox}
        </div>
        <ChoicesDropdown choices={choices} handleSelection={this.handleChoiceSelection} />
      </div>
    );

    return config.createElement('field', props, element);
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
      specialCharPlaceholder: this.createTagNode
    };

    var textBox = this.refs.textBox.getDOMNode();
    textBox.innerHTML = ''; // release any previous read-only content so it can be GC'ed

    var codeMirror = CodeMirror(textBox, options);
    codeMirror.on('change', function () {
      var newValue = this.translator.decodeValue(codeMirror.getValue());
      this.onChangeValue(newValue);
      this.setState({value: newValue});
    }.bind(this));

    this.codeMirror = codeMirror;
  },

  createReadonlyEditor: function () {
    this.removeCodeMirrorEditor();
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
    node.innerHTML = this.translator.decodeChar(char);
    node.className = 'pretty-part';
    return node;
  }
});
