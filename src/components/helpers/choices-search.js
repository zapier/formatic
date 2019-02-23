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
        renderWith={this.renderWith('ChoicesSearch')}
        className="choices-search"
      >
        <input
          renderWith={this.renderWith('ChoicesSearchInput')}
          ref={ref(this, 'input')}
          type="text"
          placeholder="Search..."
          onChange={this.props.onChange}
        />
      </div>
    );
  },
});
