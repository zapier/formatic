// # fields component

/*
Render a field to edit the values of an object with static properties.
*/

const React = require('react');
const _ = require('../../undash');

module.exports = React.createClass({

  displayName: 'FieldsField',

  onChange(value, info) {
    this.props.onChange(_.extend({}, this.props.value, {[info.key]: value}));
  },

  render() {

    const config = this.props.config;

    let childFieldElements = [];

    if (this.props.children) {
      childFieldElements = this.props.children.map(child => (
        React.cloneElement(child, {key: child.props.fieldKey, config: config, onChange: this.onChange})
      ));
    } else if (this.props.fields) {
      childFieldElements = this.props.fields.map(field => {
        const ChildField = config.fieldClass(field.type);
        return <ChildField key={field.key} {...field} config={config} onChange= {this.onChange}/>;
      });
    }

    return (
      <fieldset>
      {
        childFieldElements
      }
      </fieldset>
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
