// # array-control component

/*
Render the item type choices and the add button for an array.
*/

'use strict';

import React from 'react';
import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '../../mixins/helper';

export default createReactClass({

  displayName: 'ArrayControl',

  mixins: [HelperMixin],

  getInitialState: function () {
    return {
      fieldTemplateIndex: 0
    };
  },

  onSelect: function (index) {
    this.setState({
      fieldTemplateIndex: index
    });
  },

  onAppend: function () {
    this.props.onAppend(this.state.fieldTemplateIndex);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;

    var field = this.props.field;
    var fieldTemplates = config.fieldItemFieldTemplates(field);
    var typeChoices = null;

    if (!this.isReadOnly() && fieldTemplates.length > 0) {
      typeChoices = config.createElement('field-template-choices', {
        field: field, fieldTemplateIndex: this.state.fieldTemplateIndex, onSelect: this.onSelect
      });
    }

    let addItem;
    if (!this.isReadOnly()) {
      addItem = config.createElement('add-item', {field: field, onClick: this.onAppend, tabIndex: this.props.tabIndex});
    }

    return (
      <div className={cx(this.props.classes)}>
        {typeChoices}
        {' '}
        {addItem}
      </div>
    );
  }
});
