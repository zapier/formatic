import React from 'react';

import {cloneChild} from '../../react-utils';

const StringInputContainer = React.createClass({

  propTypes: {
    value: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired
  },

  render() {
    const {children, ...props} = this.props;

    return cloneChild(this.props.children, props);
  }
});

export default StringInputContainer;
