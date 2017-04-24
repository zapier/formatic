// # field-template-choices component

/*
Give a list of choices of item types to create as children of an field.
*/

'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var _ = require('lodash');
var cx = require('classnames');

module.exports = createReactClass({

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

    return _.isEmpty(fieldTemplates) ? null : (
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
