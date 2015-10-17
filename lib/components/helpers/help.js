import React from 'react';

const Help = React.createClass({

  render() {
    const {help} = this.props;

    return !help ? null : (
      <div>
        {help}
      </div>
    );
  }
});

export default Help;
