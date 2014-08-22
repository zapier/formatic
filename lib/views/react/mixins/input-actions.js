'use strict';

module.exports = {
  onFocus: function () {
    this.props.form.actions.focus(this.props.field);
  },

  onBlur: function () {
    this.props.form.actions.blur(this.props.field);
  },

  onChange: function (event) {
    this.props.form.actions.change(this.props.field, event.target.value);
  }
};
