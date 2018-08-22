// # fields component

/*
Render a fields in groups. Grouped by field.groupKey property.
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

var groupFields = function groupFields(fields, humanize) {
  var groupedFields = [];

  fields.forEach(function (field) {
    if (field.groupKey) {
      var group = _undash2.default.find(groupedFields, function (g) {
        return g.isGroup && field.groupKey === g.key;
      });

      if (!group) {
        group = {
          key: field.groupKey,
          label: field.groupLabel || humanize(field.groupKey),
          children: [],
          isGroup: true
        };
        groupedFields.push(group);
      }

      group.children.push(field);
    } else {
      groupedFields.push(field); // top level field
    }
  });

  return groupedFields;
};

exports.default = (0, _createReactClass2.default)({

  displayName: 'GroupedFields',

  mixins: [_field2.default],

  onChangeField: function onChangeField(key, newValue, info) {
    if (key) {
      var newObjectValue = _undash2.default.extend({}, this.props.field.value);
      newObjectValue[key] = newValue;
      this.onBubbleValue(newObjectValue, info);
    }
  },

  renderFields: function renderFields(fields, groupKey, groupLabel) {
    var config = this.props.config;
    var self = this;

    var childFields = fields.map(function (fieldOrGroup) {
      if (fieldOrGroup.isGroup) {
        return self.renderFields(fieldOrGroup.children, fieldOrGroup.key, fieldOrGroup.label);
      }

      var key = fieldOrGroup.key;
      return config.createFieldElement({
        key: key,
        field: fieldOrGroup,
        onChange: self.onChangeField.bind(self, key),
        onAction: self.onBubbleAction
      });
    });

    var legend;
    var className = (0, _classnames2.default)(this.props.classes);

    if (groupLabel) {
      legend = _react2.default.createElement(
        'legend',
        null,
        groupLabel
      );
      className += ' child-fields-group';
    }

    return _react2.default.createElement(
      'fieldset',
      { key: groupKey, className: className },
      legend,
      childFields
    );
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var fields = groupFields(config.createChildFields(field), config.humanize);

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    }, this.renderFields(fields));
  }

});