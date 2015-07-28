import React from 'react';

const StringInput = React.createClass({

  displayName: 'StringInput',

  // propTypes: {
  //   component: React.PropTypes.func.required
  // },

  onChange(event) {
    const {onChange} = this.props;

    if (onChange) {
      onChange({
        value: event.target.value
      });
    }
  },

  onFocus() {
    const {onFocus} = this.props;

    if (onFocus) {
      onFocus({});
    }
  },

  onBlur() {
    const {onBlur} = this.props;

    if (onBlur) {
      onBlur({});
    }
  },

  render() {

    const {value, defaultValue} = this.props;

    return <textarea onChange={this.onChange} value={value} defaultValue={defaultValue} onFocus={this.onFocus} onBlur={this.onBlur}/>;

    // const Input = this.props.component('Input');
    // return (
    //   <Input onChange={this.props.onChange}>
    //     {
    //       ({onChange, value}) => <textarea value={value} onChange={onChange}/>
    //     }
    //   </Input>
    // );
  }
});

export default StringInput;
