'use strict';
/* global CodeMirror */
/*eslint no-script-url:0 */

var React = require('react/addons');
var TagTranslator = require('./tag-translator');
var _ = require('../../undash');
var cx = require('classnames');

var toString = function (value) {
  if (_.isUndefined(value) || _.isNull(value)) {
    return '';
  }
  return String(value);
};

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

  displayName: 'PrettyTextInput',

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
    this.updateEditor();
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
      // With number values, onFocus never fires, which means it stays read-only. So convert to string.
      value: toString(this.props.value),
      codeMirrorMode: false,
      isChoicesOpen: false,
      replaceChoices: replaceChoices,
      translator: translator
    };
  },

  componentWillReceiveProps: function(nextProps) {
    var selectedChoices = nextProps.selectedChoices;
    var replaceChoices = nextProps.replaceChoices;
    var nextState = {
      replaceChoices: replaceChoices,
      translator: TagTranslator(selectedChoices.concat(replaceChoices), this.props.config.humanize)
    };

    // Not sure what the null/undefined checks are here for, but changed from falsey which was breaking.
    if (this.state.value !== nextProps.value && !_.isUndefined(nextProps.value) && nextProps.value !== null) {
      nextState.value = toString(nextProps.value);
    }

    this.setState(nextState);
  },

  handleChoiceSelection: function (key, event) {
    const selectChoice = () => {
      var pos = this.state.selectedTagPos;
      var tag = '{{' + key + '}}';

      if (pos) {
        this.codeMirror.replaceRange(tag, {line: pos.line, ch: pos.start}, {line: pos.line, ch: pos.stop});
      } else {
        this.codeMirror.replaceSelection(tag, 'end');
      }
      this.codeMirror.focus();

      this.setState({ isChoicesOpen: false, selectedTagPos: null });
    };
    if (this.state.codeMirrorMode) {
      selectChoice();
    } else if (this.props.readOnly) {
      // hackety hack to stop dropdown choices from toggling
      event.stopPropagation();
      this.props.onChange('{{' + key + '}}');
      this.setState({ isChoicesOpen: false });
    } else {
      this.switchToCodeMirror(selectChoice);
    }
  },

  focus: function () {
    console.log('--- focus');
    this.switchToCodeMirror(() => {
      this.codeMirror.focus();
      this.codeMirror.setCursor(this.codeMirror.lineCount(), 0);
    });
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var textBoxClasses = cx(_.extend({}, this.props.classes, {'pretty-text-box': true}));

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
      isAccordion: this.props.isAccordion,
      field: this.props.field
    });

    // Render read-only version.
    return (
      <div className={cx({'pretty-text-wrapper': true, 'choices-open': this.state.isChoicesOpen})} onMouseEnter={this.switchToCodeMirror}>
        <div className={textBoxClasses} tabIndex={this.props.tabIndex} onFocus={this.props.onFocus} onBlur={this.props.onBlur}>
          <div ref='textBox' className='internal-text-wrapper' />
        </div>
        {insertBtn}
        {choices}
      </div>
    );
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

  createEditor: function () {
    if (this.state.codeMirrorMode) {
      this.createCodeMirrorEditor();
    } else {
      this.createReadonlyEditor();
    }
  },

  updateEditor: function () {
    if (this.state.codeMirrorMode) {
      var codeMirrorValue = this.codeMirror.getValue();
      if (codeMirrorValue !== this.state.value) {
        // switch back to read-only mode to make it easier to render
        this.removeCodeMirrorEditor();
        this.createReadonlyEditor();
        this.setState({
          codeMirrorMode: false
        });
      }
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

  createReadonlyEditor: function () {
    var textBoxNode = this.refs.textBox.getDOMNode();

    var tokens = this.state.translator.tokenize(this.state.value);
    var self = this;
    var nodes = tokens.map(function (part, i) {
      if (part.type === 'tag') {
        var label = self.state.translator.getLabel(part.value);
        var props = {key: i, tag: part.value, replaceChoices: self.state.replaceChoices, field: self.props.field};
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

  switchToCodeMirror: function (cb) {
    if (!this.state.codeMirrorMode && !this.props.readOnly) {
      this.setState({codeMirrorMode: true}, () => {
        if (this.codeMirror && _.isFunction(cb)) {
          cb();
        }
      });
    }
  },

  onTagClick: function (pos) {
    this.setState({selectedTagPos: pos});
    this.onToggleChoices();
  },

  createTagNode: function (pos) {
    var node = document.createElement('span');
    var label = this.state.translator.getLabel(pos.tag);
    var config = this.props.config;

    var props = {tag: pos.tag, pos: pos, replaceChoices: this.state.replaceChoices, onClick: this.onTagClick, field: this.props.field};

    React.render(
      config.createElement('pretty-tag', props, label),
      node
    );

    return node;
  }
});
