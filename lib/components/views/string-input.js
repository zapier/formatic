import React from 'react';

const StringInputView = React.createClass({
  render() {
    return <textarea {...this.props}/>;
  }
});

export default StringInputView;
