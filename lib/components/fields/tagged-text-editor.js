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
var TaggedTextEditor = React.createClass({
  propTypes: {
    value: React.PropTypes.string
  },

  getDefaultProps: function() {
    return { value: '' };
  },

  componentWillUnmount: function() {
    this.removeCodeMirror();
  },

  getInitialState: function() {
    this.translator = TagTranslator(this.props.choices);
    return null;
  },

  handleSelection: function (key) {
    var char = this.translator.encodeTag(key);
    // TODO: put the cursor at the end of the inserted selection.
    // The "end" is supposed to do that according to the CodeMirror docs
    // but it doesn't seem to be working.
    this.codeMirror.replaceSelection(char, 'end');
  },

  render: function() {
    var html = this.translator.toHtml(this.props.value);
    var tabIndex = this.props.tabIndex;
    var choices = this.props.choices;

    // Render read-only version. We are using pure HTML via dangerouslySetInnerHTML, to avoid
    // the cost of the react nodes. This is probably a premature optimization.
    return (
      <div onMouseLeave={this.switchToReadOnly} onMouseEnter={this.switchToCodeMirror}>
        <div className="pretty-text-box form-control" tabIndex={this.props.tabIndex}>
          <div ref="textBox" dangerouslySetInnerHTML={{__html: html}} />
        </div>
        <ChoicesDropdown choices={choices} handleSelection={this.handleSelection} />
      </div>
    );
  },

  switchToCodeMirror: function () {
    if (!this.codeMirror) {
      var cmValue = this.translator.encodeValue(this.props.value);

      var options = {
        tabindex: this.props.tabIndex,
        value: cmValue,
        specialChars: this.translator.specialCharsRegexp,
        specialCharPlaceholder: this.createTagNode
      };

      var textBox = this.refs.textBox.getDOMNode();
      textBox.innerHTML = ''; // release previous read-only content so it can be GC'ed
      this.codeMirror = CodeMirror(textBox, options);
    }
  },

  removeCodeMirror: function () {
    var textBoxNode = this.refs.textBox.getDOMNode();
    var cmNode = textBoxNode.firstChild;
    textBoxNode.removeChild(cmNode);
    textBoxNode.innerHTML = this.translator.toHtml(this.props.value);
    this.codeMirror = null;
  },

  switchToReadOnly: function () {
    if (this.codeMirror) {
      var cmValue = this.codeMirror.getValue();
      var value = this.translator.decodeValue(cmValue);

      this.removeCodeMirror();
      this.props.newValue(value);
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

module.exports = TaggedTextEditor;
