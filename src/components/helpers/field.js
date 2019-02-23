// # field component

/*
Used by any fields to put the label and help text around the field.
*/

'use strict';

import createReactClass from 'create-react-class';
import _ from '../../undash';
import cx from 'classnames';

import HelperMixin from '../../mixins/helper';

/** @jsx jsx */
import jsx from '../../jsx';

export default createReactClass({
  displayName: 'Field',

  mixins: [HelperMixin],

  getInitialState: function() {
    return {
      collapsed: this.props.config.fieldIsCollapsed(this.props.field)
        ? true
        : false,
    };
  },

  onClickLabel: function() {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function() {
    const config = this.props.config;

    if (this.props.plain) {
      return this.props.children;
    }

    const field = this.props.field;

    let index = this.props.index;
    if (!_.isNumber(index)) {
      const key = this.props.field.key;
      index = _.isNumber(key) ? key : undefined;
    }

    const classes = _.extend({}, this.props.classes);

    const errors = config.fieldErrors(field);

    errors.forEach(function(error) {
      classes['validation-error-' + error.type] = true;
    });

    if (config.fieldIsRequired(field)) {
      classes.required = true;
    } else {
      classes.optional = true;
    }

    if (this.isReadOnly()) {
      classes.readonly = true;
    }

    const label = config.createElement('label', {
      typeName: this.props.typeName,
      config,
      field,
      index,
      onClick: config.fieldIsCollapsible(field) ? this.onClickLabel : null,
    });

    const content = config.cssTransitionWrapper(
      this.state.collapsed
        ? [label]
        : [
            config.createElement(
              'field-body',
              {
                typeName: this.props.typeName,
                config,
                label,
                help: config.createElement('help', {
                  typeName: this.props.typeName,
                  config,
                  field,
                  key: 'help',
                }),
                key: 'field-body',
              },
              this.props.children
            ),
          ]
    );

    return (
      <div
        renderWith={this.renderWith('Field')}
        className={cx(classes)}
        style={{ display: field.hidden ? 'none' : '' }}
      >
        {content}
      </div>
    );
  },
});
