// # array-control component

/*
Render the item type choices and the add button for an array.
*/

'use strict';

import createReactClass from 'create-react-class';
import cx from 'classnames';

import HelperMixin from '@/src/mixins/helper';

/** @jsx jsx */
import jsx from '@/src/jsx';

export default createReactClass({
  displayName: 'ArrayControl',

  mixins: [HelperMixin],

  getInitialState: function() {
    return {
      fieldTemplateIndex: 0,
    };
  },

  onSelect: function(index) {
    this.setState({
      fieldTemplateIndex: index,
    });
  },

  onAppend: function() {
    this.props.onAppend(this.state.fieldTemplateIndex);
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const config = this.props.config;

    const field = this.props.field;
    const fieldTemplates = config.fieldItemFieldTemplates(field);
    let typeChoices = null;

    if (!this.isReadOnly() && fieldTemplates.length > 0) {
      typeChoices = config.createElement('field-template-choices', {
        typeName: this.props.typeName,
        field,
        fieldTemplateIndex: this.state.fieldTemplateIndex,
        id: this.props.id,
        onSelect: this.onSelect,
      });
    }

    let addItem;
    if (!this.isReadOnly()) {
      addItem = config.createElement('add-item', {
        typeName: this.props.typeName,
        field,
        onClick: this.onAppend,
        tabIndex: this.props.tabIndex,
      });
    }

    return (
      <div
        className={cx(this.props.classes)}
        renderWith={this.renderWith('ListControl')}
      >
        {typeChoices} {addItem}
      </div>
    );
  },
});
