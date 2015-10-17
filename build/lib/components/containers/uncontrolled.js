'use strict';

var React = require('react');
var _ = require('../../undash');

module.exports = React.createClass({

  displayName: 'UncontrolledContainer',

  getInitialState: function getInitialState() {
    return {
      isControlled: !_.isUndefined(this.props.value),
      value: _.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    if (this.state.isControlled) {
      if (!_.isUndefined(newProps.value)) {
        this.setState({
          value: newProps.value
        });
      }
    }
  },

  onChange: function onChange(event) {
    var onChange = this.props.onChange;

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

  render: function render() {
    var children = this.props.children;

    var child = React.Children.only(children);

    var childProps = _.extend({}, this.props, {
      onChange: this.onChange
    });

    var clonedChild = React.cloneElement(child, childProps);

    return clonedChild;
  }
});