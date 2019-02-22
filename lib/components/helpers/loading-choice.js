'use strict';

import createReactClass from 'create-react-class';

import HelperMixin from '../../mixins/helper';

/** @jsx jsx */
import jsx from '../../jsx';

export default createReactClass({
  displayName: 'LoadingChoice',

  mixins: [HelperMixin],

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    return (
      <span renderWith={this.renderWith('LoadingChoice')}>
        Loading choices...
      </span>
    );
  },
});
