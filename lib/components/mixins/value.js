'use strict';

module.exports = {

  componentWillUnmount: function () {
    this.props.field.erase();
  }
};
