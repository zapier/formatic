'use strict';

import createReactClass from 'create-react-class';

import HelperMixin from '@/src/mixins/helper';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'LoadingChoices',

  mixins: [HelperMixin],

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    return (
      <div renderWith={this.renderWith('LoadingChoices')}>
        Loading choices...
      </div>
    );
  },
});
