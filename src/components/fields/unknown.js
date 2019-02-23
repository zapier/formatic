// # unknown component

/*
Render a field with an unknown type.
*/

'use strict';

import createReactClass from 'create-react-class';

import FieldMixin from '@/src/mixins/field';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'Unknown',

  mixins: [FieldMixin],

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    return (
      <div renderWith={this.renderWith('FieldBody')}>
        <div renderWith={this.renderWith('NotFound')}>
          Component not found for:
        </div>
        <pre renderWith={this.renderWith('FieldTemplate')}>
          {JSON.stringify(this.props.field.rawFieldTemplate, null, 2)}
        </pre>
      </div>
    );
  },
});
