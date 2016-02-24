import React from 'react';

const JsonInputView = React.createClass({

  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    theme: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      value: null,
      theme: {
        valid: {
          style: {
            backgroundColor: ''
          }
        },
        invalid: {
          style: {
            backgroundColor: 'rgb(255,200,200)'
          }
        }
      }
    };
  },

  render() {
    const { getComponent, onChange, source, isValid, theme } = this.props;
    const themeProps = isValid ? theme.valid : theme.invalid;
    const TextareaInput = getComponent('TextareaInput');
    return (
      <TextareaInput value={source} onChange={onChange} {...themeProps}/>
    );
  }
});

export default JsonInputView;
