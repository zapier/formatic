// # unknown component

/*
Render a field with an unknown type.
*/

'use strict';

var React = require('react');

module.exports = React.createClass({

  displayName: 'Unknown',

  mixins: [require('../../mixins/field')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return (
      <div>
        <div>Component not found for:</div>
        <pre>{JSON.stringify(this.props.field.rawFieldTemplate, null, 2)}</pre>
      </div>
    );
  }
});
