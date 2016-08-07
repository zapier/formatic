// Need this rule here because we define Formatic to be used by eval.
/*eslint no-unused-vars:0 no-empty:0*/
'use strict';

var React = require('react');
var classSet = require('react/lib/cx');
var CodeMirror = global.CodeMirror;
var JSXTransformer = global.JSXTransformer;
var Bootstrap = require('react-bootstrap');
var Formatic = require('../../lib/formatic');

var IS_MOBILE = typeof navigator !== 'undefined' && (
  navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/webOS/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/BlackBerry/i)
    || navigator.userAgent.match(/Windows Phone/i)
  );

var CodeMirrorEditor = React.createClass({
  componentDidMount: function() {
    if (IS_MOBILE) {
      return;
    }

    this.editor = CodeMirror.fromTextArea(this.refs.editor.getDOMNode(), {
      mode: 'javascript',
      lineNumbers: false,
      lineWrapping: true,
      matchBrackets: true,
      tabSize: 2,
      theme: 'solarized-light',
      readOnly: this.props.readOnly
    });
    this.editor.on('change', this.handleChange);
  },

  componentDidUpdate: function() {
    if (this.props.readOnly) {
      this.editor.setValue(this.props.code);
    }
  },

  handleChange: function() {
    if (!this.props.readOnly) {
      if (this.props.onChange) {
        this.props.onChange(this.editor.getValue());
      }
    }
  },

  render: function() {
    // wrap in a div to fully contain CodeMirror
    var editor;

    if (IS_MOBILE) {
      var preStyles = {overflow: 'scroll'};
      editor = <pre style={preStyles}>{this.props.code}</pre>;
    } else {
      editor = <textarea ref="editor" defaultValue={this.props.code} />;
    }

    return (
      <div style={this.props.style} className={this.props.className}>
        {editor}
      </div>
      );
  }
});

var selfCleaningTimeout = {
  componentDidUpdate: function() {
    clearTimeout(this.timeoutID);
  },

  setTimeout: function() {
    clearTimeout(this.timeoutID);
    this.timeoutID = setTimeout.apply(null, arguments);
  }
};

var ReactPlayground = React.createClass({
  mixins: [selfCleaningTimeout],

  MODES: {JSX: 'JSX', JS: 'JS', OUTPUT: 'OUTPUT', NONE: null},

  propTypes: {
    code: React.PropTypes.string.isRequired,
    transformer: React.PropTypes.func,
    renderCode: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      transformer: function(code) {
        return JSXTransformer.transform(code).code;
      }
    };
  },

  getInitialState: function() {
    return {
      mode: this.MODES.NONE,
      code: this.props.code,
      output: null
    };
  },

  handleCodeChange: function(value) {
    this.setState({code: value});
    this.executeCode();
  },

  handleCodeModeSwitch: function(mode) {
    this.setState({mode: mode});
  },

  handleCodeModeToggle: function(e) {
    var mode;

    e.preventDefault();

    if (this.state.mode !== this.MODES.JSX) {
      mode = this.MODES.JSX;
    } else {
      mode = this.MODES.NONE;
    }

    this.setState({mode: mode});
  },

  handleOutputModeToggle: function (e) {
    var mode;

    e.preventDefault();

    if (this.state.mode !== this.MODES.OUTPUT) {
      mode = this.MODES.OUTPUT;
    } else {
      mode = this.MODES.NONE;
    }

    this.setState({mode: mode});
  },

  compileCode: function() {
    return this.props.transformer(this.state.code);
  },

  render: function() {
    var classes = {
      'bs-example': true
    };
    var toggleClasses = {
      code: {
        'code-toggle': true
      },
      output: {
        'code-toggle': true
      }
    };
    var drawer;

    if (this.props.exampleClassName){
      classes[this.props.exampleClassName] = true;
    }

    if (this.state.mode === this.MODES.JSX) {
      drawer = (
        <CodeMirrorEditor
          key="jsx"
          onChange={this.handleCodeChange}
          className="highlight"
          code={this.state.code}/>
      );
      toggleClasses.code.open = true;
    } else if (this.state.mode === this.MODES.OUTPUT) {
      drawer = (
        <pre className="highlight">{JSON.stringify(this.state.output, null, 2)}</pre>
      );
      toggleClasses.output.open = true;
    }
    if (this.state.mode !== this.MODES.NONE) {
      Object.keys(toggleClasses).forEach(function (toggleKey) {
        if (!toggleClasses[toggleKey].open) {
          toggleClasses[toggleKey].under = true;
        }
      });
    }

    var valueTab = null;

    if (!this.props.hideValueTab) {
      valueTab = <a className={classSet(toggleClasses.output)} onClick={this.handleOutputModeToggle} href="#">{this.state.mode !== this.MODES.OUTPUT ? 'show value' : 'hide value'}</a>;
    }

    return (
      <div className="playground">
        <div className={classSet(classes)}>
          <div ref="mount" />
        </div>
        {drawer}
        <a className={classSet(toggleClasses.code)} onClick={this.handleCodeModeToggle} href="#">{this.state.mode !== this.MODES.JSX ? 'show code' : 'hide code'}</a>
        { valueTab }
      </div>
      );
  },

  componentDidMount: function() {
    this.executeCode();
  },

  componentWillUpdate: function(nextProps, nextState) {
    // execute code only when the state's not being updated by switching tab
    // this avoids re-displaying the error, which comes after a certain delay
    if (this.state.code !== nextState.code) {
      this.executeCode();
    }
  },

  componentWillUnmount: function() {
    var mountNode = this.refs.mount.getDOMNode();
    try {
      React.unmountComponentAtNode(mountNode);
    } catch (e) { }
  },

  onChangeValue: function (newValue) {
    this.setState({
      output: newValue
    });
  },

  executeCode: function() {
    /*eslint no-eval:0*/

    var mountNode = this.refs.mount.getDOMNode();

    try {
      React.unmountComponentAtNode(mountNode);
    } catch (e) { }

    try {
      var compiledCode = this.compileCode();
      if (this.props.renderCode) {
        React.render(
          <CodeMirrorEditor code={compiledCode} readOnly={true} />,
          mountNode
        );
      } else {
        eval(compiledCode);
      }
    } catch (err) {
      this.setTimeout(function() {
        React.render(
          <Bootstrap.Alert bsStyle="danger">{err.toString()}</Bootstrap.Alert>,
          mountNode
        );
      }, 500);
    }
  }
});

module.exports = ReactPlayground;
