'use strict';

var React = require('react');
var _ = require('../../undash');

module.exports = React.createClass({

  displayName: 'InputContainer',

  // getInitialState() {
  //   return {
  //     isControlled: !_.isUndefined(this.props.value),
  //     value: _.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value
  //   };
  // },
  //
  // componentWillReceiveProps (newProps) {
  //   if (this.state.isControlled) {
  //     if (!_.isUndefined(newProps.value)) {
  //       this.setState({
  //         value: newProps.value
  //       });
  //     }
  //   }
  // },

  onChange: function onChange(event) {
    // const {onChange} = this.props;
    // if (!this.state.isControlled) {
    //   this.setState({
    //     value: newValue
    //   });
    // }
    // if (!this.props.onChange) {
    //   return;
    // }
    //this.props.onChange(newValue);
    this.props.onChange(event.target.value);
  },

  render: function render() {
    var children = this.props.children;

    var childProps = { onChange: this.onChange };
    if (_.isFunction(children)) {
      return children(childProps);
    }
    var clonedChildren = React.Children.map(children, function (child) {
      return React.cloneElement(child, childProps);
    });
    return React.createElement(
      'span',
      null,
      clonedChildren
    );
  }

  // getInitialState() {
  //   return {
  //     isControlled: !_.isUndefined(this.props.value),
  //     value: _.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value
  //   };
  // },
  //
  // componentWillReceiveProps (newProps) {
  //   if (this.state.isControlled) {
  //     if (!_.isUndefined(newProps.value)) {
  //       this.setState({
  //         value: newProps.value
  //       });
  //     }
  //   }
  // },
  //
  // onChange (newValue) {
  //   if (!this.state.isControlled) {
  //     this.setState({
  //       value: newValue
  //     });
  //   }
  //   if (!this.props.onChange) {
  //     return;
  //   }
  //   this.props.onChange(newValue);
  // },
  //
  // render() {
  //
  //   const InputType = this.props.component(this.props.type);
  //
  //   return (
  //     <InputType {...this.props} value={this.state.value} onChange={this.onChange}/>
  //   );
  // }
});