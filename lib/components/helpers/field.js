import React from 'react';

const Field = React.createClass({

  propTypes: {
    components: React.PropTypes.object.isRequired
  },

  render() {
    const {Label, Help} = this.props.components;

    return (
      <div>
        <Label {...this.props}/>
        <Help {...this.props}/>
        {this.props.children}
      </div>
    );
  }
});

export default Field;
