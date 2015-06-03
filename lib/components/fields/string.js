const React = require('react');

module.exports = React.createClass({

  displayName: 'StringField',

  onChange(event) {
    this.props.onChange(event.target.value, {key: this.props.fieldKey});
  },

  render() {
    const config = this.props.config;

    const Field = config.helperClass('field');

    return (
      <Field {...this.props}>
        <textarea value={this.props.value} onChange={this.onChange}/>
      </Field>
    );
  }

});

// // # string component
//
// /*
// Render a field that can edit a string value.
// */
//
// 'use strict';
//
// var React = require('react/addons');
// var R = React.DOM;
// var cx = require('classnames');
//
// module.exports = React.createClass({
//
//   displayName: 'String',
//
//   mixins: [require('../../mixins/field')],
//
//   onChange: function (event) {
//     this.onChangeValue(event.target.value);
//   },
//
//   render: function () {
//     return this.renderWithConfig();
//   },
//
//   renderDefault: function () {
//
//     var config = this.props.config;
//     var field = this.props.field;
//
//     return config.createElement('field', {
//       config: config, field: field, plain: this.props.plain
//     }, R.textarea({
//       value: field.value,
//       className: cx(this.props.classes),
//       rows: field.rows || this.props.rows,
//       onChange: this.onChange,
//       onFocus: this.onFocusAction,
//       onBlur: this.onBlurAction
//     }));
//   }
// });
