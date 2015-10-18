// # fields component

/*
Render a field to edit the values of an object with static properties.
*/

'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var React = require('react');
var _ = require('../../undash');

module.exports = React.createClass({

  displayName: 'FieldsField',

  onChange: function onChange(value, info) {
    this.props.onChange(_.extend({}, this.props.value, _defineProperty({}, info.key, value)));
  },

  render: function render() {
    var _this = this;

    var config = this.props.config;

    var childFieldElements = [];

    if (this.props.children) {
      childFieldElements = this.props.children.map(function (child) {
        return React.cloneElement(child, { key: child.props.fieldKey, config: config, onChange: _this.onChange });
      });
    } else if (this.props.fields) {
      childFieldElements = this.props.fields.map(function (field) {
        var ChildField = config.fieldClass(field.type);
        return React.createElement(ChildField, _extends({ key: field.key }, field, { config: config, onChange: _this.onChange }));
      });
    }

    return React.createElement(
      'fieldset',
      null,
      childFieldElements
    );
  }

});

// 'use strict';
//
// var React = require('react/addons');
// var R = React.DOM;
// var _ = require('../../undash');
// var cx = require('classnames');
//
// module.exports = React.createClass({
//
//   displayName: 'Fields',
//
//   mixins: [require('../../mixins/field')],
//
//   onChangeField: function (key, newValue, info) {
//     if (key) {
//       var newObjectValue = _.extend({}, this.props.field.value);
//       newObjectValue[key] = newValue;
//       this.onBubbleValue(newObjectValue, info);
//     }
//   },
//
//   render: function () {
//     return this.renderWithConfig();
//   },
//
//   renderDefault: function () {
//     var config = this.props.config;
//     var field = this.props.field;
//
//     var fields = config.createChildFields(field);
//
//     return config.createElement('field', {
//       config: config, field: field, plain: this.props.plain
//     },
//       R.fieldset({className: cx(this.props.classes)},
//         fields.map(function (childField, i) {
//           var key = childField.key || i;
//           return config.createFieldElement({
//             key: key || i,
//             field: childField,
//             onChange: this.onChangeField.bind(this, key), onAction: this.onBubbleAction
//           });
//         }.bind(this))
//       )
//     );
//   }
//
// });