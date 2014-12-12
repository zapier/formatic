'use strict';

module.exports = {

  renderWithConfig: function () {
    return this.props.config.renderComponent(this);
  }
};
