import React from 'react';

const StringInput = React.createClass({

  displayName: 'StringInput',

  propTypes: {
    component: React.PropTypes.func.required
  },

  render() {
    const Input = this.props.component('Input');
    return (
      <Input onChange={this.props.onChange}>
        {
          ({onChange, value}) => <textarea value={value} onChange={onChange}/>
        }
      </Input>
    );
  }
});

export default StringInput;
