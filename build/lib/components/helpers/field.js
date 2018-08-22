// # field component

/*
Used by any fields to put the label and help text around the field.
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

var _helper = require('../../mixins/helper');

var _helper2 = _interopRequireDefault(_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _createReactClass2.default)({

  displayName: 'Field',

  mixins: [_helper2.default],

  getInitialState: function getInitialState() {
    return {
      collapsed: this.props.config.fieldIsCollapsed(this.props.field) ? true : false
    };
  },

  onClickLabel: function onClickLabel() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;

    if (this.props.plain) {
      return this.props.children;
    }

    var field = this.props.field;

    var index = this.props.index;
    if (!_undash2.default.isNumber(index)) {
      var key = this.props.field.key;
      index = _undash2.default.isNumber(key) ? key : undefined;
    }

    var classes = _undash2.default.extend({}, this.props.classes);

    var errors = config.fieldErrors(field);

    errors.forEach(function (error) {
      classes['validation-error-' + error.type] = true;
    });

    if (config.fieldIsRequired(field)) {
      classes.required = true;
    } else {
      classes.optional = true;
    }

    if (this.isReadOnly()) {
      classes.readonly = true;
    }

    var label = config.createElement('label', {
      config: config,
      field: field,
      index: index,
      onClick: config.fieldIsCollapsible(field) ? this.onClickLabel : null
    });

    var help = config.cssTransitionWrapper(this.state.collapsed ? [] : [config.createElement('help', {
      config: config, field: field,
      key: 'help'
    }), this.props.children]);

    return _react2.default.createElement(
      'div',
      {
        className: (0, _classnames2.default)(classes),
        style: { display: field.hidden ? 'none' : '' } },
      label,
      help
    );
  }
});