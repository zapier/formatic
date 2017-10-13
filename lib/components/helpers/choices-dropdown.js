'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';

import _ from '../../undash';
import HelperMixin from '../../mixins/helper';
import { ref } from '../../utils';

/*
   Choices drop down component for picking pretty text tags.

   Properties:
   - handleSelection: choice selection callback, passed the selected tag key

   TODO: Implemented via Bootstrap dropdown for now but we
   want to remove that dependency.
 */
export default createReactClass({

  displayName: 'ChoicesDropdown',

  mixins: [HelperMixin],

  propTypes: {
    handleSelection: PropTypes.func.isRequired
  },

  handleClick: function (key) {
    this.props.handleSelection(key);
  },

  items: function () {
    var self = this;
    var items = [];
    var index = 0;
    var choices = this.props.choices;
    var len = Object.keys(choices).length;

    _.each(choices, function (value, key) {
      index++;
      var clickHandler = self.handleClick.bind(self, key);

      items.push(
        <li key={key} onClick={clickHandler}>
          <a tabIndex="-1"><span><strong>{value}</strong></span> | <span><em>{key}</em></span></a>
        </li>
      );

      if (index < len) {
        var dividerKey = '_' + index; // squelch React warning about needing a key
        items.push(<li key={dividerKey} role="presentation" className="divider" />);
      }
    });

    return items;
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    var items = this.items();

    return (
      <div className="dropdown">
        <a ref={ref(this, 'dropdownToggle')} href="#" className="dropdown-toggle" data-toggle="dropdown">Insert...</a>
        <ul className="dropdown-menu">
          {items}
        </ul>
      </div>
    );
  }
});
