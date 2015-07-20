const React = require('react');
const _ = require('../../undash');

module.exports = React.createClass({

  displayName: 'FieldContainer',

  onChange(fieldKey, value) {
    const {onChange} = this.props;
    onChange(event.target.value);
  },

  render() {
    const {children} = this.props;
    if (_.isFunction(children)) {
      return children({onChange: this.onChange});
    }
    return null;
  }
});
