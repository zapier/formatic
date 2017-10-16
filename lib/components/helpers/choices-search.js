// # choices-search component

/*
   Render a search box for choices.
 */

'use strict';

import React from 'react';
import createReactClass from 'create-react-class';

import HelperMixin from '../../mixins/helper';
import { ref } from '../../utils';

export default createReactClass({

  displayName: 'ChoicesSearch',

  mixins: [HelperMixin],

  focus() {
    this.inputRef.focus();
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return (
      <div className="choices-search">
        <input ref={ref(this, 'input')} type="text" placeholder="Search..." onChange={this.props.onChange}/>
      </div>
    );
  }

});
