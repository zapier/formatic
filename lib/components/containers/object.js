import React from 'react';
import u from '../../undash';

const ObjectContainer = React.createClass({

  propTypes: {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    components: React.PropTypes.object.isRequired
  },

  value() {
    const {value} = this.props;
    if (u.isUndefined(value)) {
      return {};
    }
    return value;
  },

  onChangeChild(newChildValue, info) {
    const key = info.path[0];
    const newValue = u.extend({}, this.value(), {
      [key]: newChildValue
    });
    this.props.onChange(newValue, info);
  },

  childContextTypes: {
    onChangeChild: React.PropTypes.func.isRequired,
    components: React.PropTypes.object.isRequired
  },

  getChildContext() {
    return {
      onChangeChild: this.onChangeChild,
      components: this.props.components
    };
  },

  render() {
    const {children} = this.props;
    if (u.isFunction(children)) {
      return children(this.getChildContext());
    }
    return children;
  }
});

export default ObjectContainer;
