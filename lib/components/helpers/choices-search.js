// # choices-search component

/*
   Render a search box for choices.
 */

'use strict';

import React from 'react';

import HelperMixin from '../../mixins/helper';

export default React.createClass({

  displayName: 'ChoicesSearch',

  mixins: [HelperMixin],

  focus() {
    this.refs.input.focus();
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return (
      <div className="choices-search">
        <input ref="input" type="text" placeholder="Search..." onChange={this.props.onChange}/>
      </div>
    );
  }

});
