import React, { PropTypes } from 'react';
import _ from 'lodash';

const JsonInputState = React.createClass({

  propTypes: {
    onChange: PropTypes.func.isRequired,
    validator: PropTypes.func.isRequired,
    view: PropTypes.func.isRequired
  },

  getInitialState() {
    const { value } = this.props;
    return {
      isValid: true,
      source: JSON.stringify(value, null, 2)
    };
  },

  componentWillReceiveProps(nextProps) {
    const { value: nextValue } = nextProps;
    const { value: prevValue } = this.props;
    if (nextValue !== prevValue && this.nextValue !== nextValue) {
      if (!_.isEqual(nextValue, prevValue)) {
        this.setState({
          isValue: true,
          source: JSON.stringify(nextValue, null, 2)
        });
      }
    }
    this.nextValue = undefined;
  },

  onChange(value, {isValid, source}) {
    const { onChange } = this.props;
    if (isValid) {
      this.nextValue = value;
      onChange(value, {isValid, source});
    } else {
      onChange(value, {isValid, source});
    }
    this.setState({
      source,
      isValid
    });
  },

  render() {
    const { source, isValid } = this.state;
    const { props, onChange } = this;
    const { validator: Validator, view, value } = props;
    return <Validator {...props} view={view} value={value} source={source} isValid={isValid} onChange={onChange}/>;
  }
});

export default JsonInputState;
