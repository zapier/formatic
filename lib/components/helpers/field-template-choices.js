// # field-template-choices component

/*
Give a list of choices of item types to create as children of an field.
*/

'use strict';

var React = require('react');
var cx = require('classnames');

module.exports = React.createClass({

  displayName: 'FieldTemplateChoices',

  mixins: [require('../../mixins/helper')],

  onChange: function (event) {
    this.props.onSelect(parseInt(event.target.value));
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;

    var fieldTemplates = config.fieldItemFieldTemplates(field);

    return (fieldTemplates.length < 2) ? null : (
      <select
        className={cx(this.props.classes)}
        value={this.fieldTemplateIndex}
        onChange={this.onChange}>
        {
          fieldTemplates.map((fieldTemplate, i) => (
            <option key={i} value={i}>
              { fieldTemplate.label || i}
            </option>
          ))
        }
      </select>
    );
  }
});
