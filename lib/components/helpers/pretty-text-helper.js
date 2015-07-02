'use strict';
/* global CodeMirror */
/*eslint no-script-url:0 */

var React = require('react/addons');
var TagTranslator = require('./tag-translator');
var _ = require('../../undash');
var cx = require('classnames');

/*
   Editor for tagged text. Renders text like "hello {{firstName}}"
   with replacement labels rendered in a pill box. Designed to load
   quickly when many separate instances of it are on the same
   page.

   Uses CodeMirror to edit text. To save memory the CodeMirror node is
   instantiated when the user moves the mouse into the edit area.
   Initially a read-only view using a simple div is shown.
 */
module.exports = React.createClass({

  displayName: 'PrettyTextHelper',

  mixins: [require('../../mixins/helper')],

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
    if (this.state.codeMirrorMode) {
      this.removeCodeMirrorEditor();
    }
  },

  getInitialState: function() {
    var selectedChoices = this.props.selectedChoices;
    var replaceChoices = this.props.replaceChoices;
    var translator = TagTranslator(selectedChoices.concat(replaceChoices), this.props.config.humanize);

    return {
      value: this.props.value,
      codeMirrorMode: this.props.isEditable,
      replaceChoices: replaceChoices,
      translator: translator
    };
  },

  componentWillReceiveProps: function(nextProps) {
    var nextState = {
      replaceChoices: nextProps.replaceChoices,
      translator: TagTranslator(this.props.selectedChoices.concat(nextProps.replaceChoices), this.props.config.humanize),
      codeMirrorMode: nextProps.isEditable
    };

    if (this.state.value !== nextProps.value && nextProps.value) {
      nextState.value = nextProps.value;
    }

    this.setState(nextState);
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var textBoxClasses = cx(_.extend({}, this.props.classes, {'pretty-text-box': true}));

    // Render read-only version.
    return (
      <div className={textBoxClasses} tabIndex={this.props.tabIndex} onFocus={this.props.onFocus} onBlur={this.props.onBlur}>
        <div ref='textBox' className='internal-text-wrapper' />
      </div>
    );
  },

  createEditor: function () {
    if (this.state.codeMirrorMode) {
      this.createCodeMirrorEditor();
    } else {
      this.createReadonlyEditor();
    }
  },

  createCodeMirrorEditor: function () {
    var options = {
      lineWrapping: true,
      tabindex: this.props.tabIndex,
      value: String(this.state.value),
      mode: null,
      extraKeys: {
        Tab: false
      }
    };

    var textBox = this.refs.textBox.getDOMNode();
    textBox.innerHTML = ''; // release any previous read-only content so it can be GC'ed

    this.codeMirror = CodeMirror(textBox, options);
    this.codeMirror.on('change', this.onCodeMirrorChange);

    this.tagCodeMirror();
  },

  tagCodeMirror: function () {
    var positions = this.state.translator.getTagPositions(this.codeMirror.getValue());
    var self = this;

    var tagOps = function () {
      positions.forEach(function (pos) {
        var node = self.createTagNode(pos);
        self.codeMirror.markText({line: pos.line, ch: pos.start},
                                 {line: pos.line, ch: pos.stop},
                                 {replacedWith: node, handleMouseEvents: true});
      });
    };

    this.codeMirror.operation(tagOps);
  },

  onCodeMirrorChange: function () {
    if (this.updatingCodeMirror) {
      // avoid recursive update cycle, and mark the code mirror manual update as done
      this.updatingCodeMirror = false;
      return;
    }

    var newValue = this.codeMirror.getValue();
    this.props.onChange(newValue);
    this.setState({value: newValue});
    this.tagCodeMirror();
  },

  insertText: function(text, pos) {
    if (pos) {
      this.codeMirror.replaceRange(text, {line: pos.line, ch: pos.start}, {line: pos.line, ch: pos.stop});
    } else {
      this.codeMirror.replaceSelection(text, 'end');
    }
    this.codeMirror.focus();
  },

  createReadonlyEditor: function () {
    var textBoxNode = this.refs.textBox.getDOMNode();

    var tokens = this.state.translator.tokenize(this.state.value);
    var self = this;
    var nodes = tokens.map(function (part, i) {
      if (part.type === 'tag') {
        var label = self.state.translator.getLabel(part.value);
        var props = {key: i, tag: part.value, replaceChoices: self.state.replaceChoices};
        return self.props.config.createElement('pretty-tag', props, label);
      }
      return <span key={i}>{part.value}</span>;
    });

    React.render(<span>{nodes}</span>, textBoxNode);
  },

  removeCodeMirrorEditor: function () {
    var textBoxNode = this.refs.textBox.getDOMNode();
    var cmNode = textBoxNode.firstChild;
    textBoxNode.removeChild(cmNode);
    this.codeMirror = null;
  },

  createTagNode: function (pos) {
    var node = document.createElement('span');
    var label = this.state.translator.getLabel(pos.tag);
    var config = this.props.config;

    var onTagClick = function () {
      this.props.onTagClick(pos);
    };

    var props = {tag: pos.tag, replaceChoices: this.state.replaceChoices, onClick: onTagClick.bind(this)};

    React.render(
      config.createElement('pretty-tag', props, label),
      node
    );

    return node;
  }
});
