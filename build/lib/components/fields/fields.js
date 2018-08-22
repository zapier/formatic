// # fields component

/*
Render a field to edit the values of an object with static properties.
*/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _undash = require('../../undash');

var _undash2 = _interopRequireDefault(_undash);

var _field = require('../../mixins/field');

var _field2 = _interopRequireDefault(_field);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _createReactClass2.default)({

  displayName: 'Fields',

  mixins: [_field2.default],

  onChangeField: function onChangeField(key, newValue, info) {
    if (!key) {
      var parentPath = this.props.config.fieldValuePath(this.props.field);
      var childPath = this.props.config.fieldValuePath(info.field).slice(parentPath.length);
      key = childPath[0];
      if (key) {
        newValue = newValue[key];
      }
    }
    if (key) {
      var newObjectValue = _undash2.default.extend({}, this.props.field.value);
      newObjectValue[key] = newValue;
      this.onBubbleValue(newObjectValue, info);
    }
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var fields = config.createChildFields(field);

    // Want to move to fieldset with legend, but doing a little backward-compatible
    // hacking here, only converting child `fields` without keys.
    var isGroup = !!(field.parent && !field.key);

    var classes = _undash2.default.extend({}, this.props.classes);

    if (isGroup) {
      classes['child-fields-group'] = true;
    }

    var legend = !isGroup ? null : _react2.default.createElement(
      'legend',
      null,
      config.fieldLabel(field)
    );

    var help = !isGroup ? null : config.createElement('help', {
      config: config,
      field: field
    });

    var content = fields.map(function (childField, i) {
      var key = childField.key || i;
      return config.createFieldElement({
        key: key || i,
        field: childField,
        onChange: this.onChangeField.bind(this, childField.key), onAction: this.onBubbleAction
      });
    }.bind(this));

    return config.createElement('field', {
      config: config, field: field, plain: isGroup || this.props.plain
    }, _react2.default.createElement(
      'fieldset',
      { className: (0, _classnames2.default)(classes) },
      legend,
      help,
      content
    ));
  }

});