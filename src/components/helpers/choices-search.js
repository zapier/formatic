// # choices-search component

/*
   Render a search box for choices.
 */

'use strict';

import createReactClass from 'create-react-class';

import HelperMixin from '@/src/mixins/helper';
import { ref } from '@/src/utils';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'ChoicesSearch',

  mixins: [HelperMixin],

  focus() {
    this.inputRef.focus();
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    return (
      <div
        className="choices-search"
        renderWith={this.renderWith('ChoicesSearch')}
      >
        <input
          onChange={this.props.onChange}
          placeholder="Search..."
          ref={ref(this, 'input')}
          renderWith={this.renderWith('ChoicesSearchInput')}
          type="text"
        />
      </div>
    );
  },
});
