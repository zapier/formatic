const React = require('react');
const _ = require('../../undash');

module.exports = React.createClass({

  displayName: 'UncontrolledContainer',

  getInitialState() {
    return {
      isControlled: !_.isUndefined(this.props.value),
      value: _.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value
    };
  },

  componentWillReceiveProps(newProps) {
    if (this.state.isControlled) {
      if (!_.isUndefined(newProps.value)) {
        this.setState({
          value: newProps.value
        });
      }
    }
  },

  onChange(event) {
    const {onChange} = this.props;
    if (!this.state.isControlled) {
      this.setState({
        value: event.value
      });
    }
    if (!onChange) {
      return;
    }
    onChange(event);
  },

  render() {
    const {children} = this.props;

    const child = React.Children.only(children);

    const childProps = _.extend({}, this.props, {
      onChange: this.onChange
    });

    const clonedChild = React.cloneElement(child, childProps);

    return clonedChild;
  }
});
