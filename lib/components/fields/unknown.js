// # unknown component

/*
Render a field with an unknown type.
*/

'use strict';

import React from 'react';

import FieldMixin from '../../mixins/field';

export default React.createClass({

  displayName: 'Unknown',

  mixins: [FieldMixin],

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
