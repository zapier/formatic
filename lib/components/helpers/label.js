import React from 'react';

const Label = React.createClass({

  render() {
    const {label = ''} = this.props;

    return (
      <div>
        {label}
      </div>
    );
  }
});

export default Label;
