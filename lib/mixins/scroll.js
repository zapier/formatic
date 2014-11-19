// # mixin.scroll

'use strict';

module.exports = function (plugin) {

  plugin.exports = {

    componentDidMount: function () {
      if (this.onScrollWindow) {
        window.addEventListener('scroll', this.onScrollWindow);
      }
    },

    componentWillUnmount: function () {
      if (this.onScrollWindow) {
        window.removeEventListener('scroll', this.onScrollWindow);
      }
    }
  };
};
