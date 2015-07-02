// # pretty-select-input component

/*
   Render an input to be used as the element for typing a custom value into a pretty select.
 */

'use strict';

var React = require('react/addons');
var _ = require('underscore');
var cx = require('classnames');

module.exports = React.createClass({

  displayName: 'PrettySelectInput',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    if (this.props.isEnteringCustomValue) {
      return <input className={cx(_.extend({}, this.props.classes))} ref="customInput" type="text" value={this.props.field.value}
                    onChange={this.props.onChange} onFocus={this.props.onFocus} onBlur={this.props.onBlur} />;
    }

    return <input type="text" value={this.props.getDisplayValue()} readOnly onFocus={this.props.onFocus} onBlur={this.props.onBlur} />;
  },

});
