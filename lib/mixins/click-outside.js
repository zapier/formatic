// # mixin.click-outside

/*
There's no native React way to detect clicking outside an element. Sometimes
this is useful, so that's what this mixin does. To use it, mix it in and use it
from your component like this:

```js
module.exports = function (plugin) {
  plugin.exports = React.createClass({

    mixins: [plugin.require('mixin.click-outside')],

    onClickOutside: function () {
      console.log('clicked outside!');
    },

    componentDidMount: function () {
      this.setOnClickOutside('myDiv', this.onClickOutside);
    },

    render: function () {
      return React.DOM.div({ref: 'myDiv'},
        'Hello!'
      )
    }
  });
};
```
*/

'use strict';

var hasAncestor = function (child, parent) {
  if (child.parentNode === parent) {
    return true;
  }
  if (child.parentNode === child.parentNode) {
    return false;
  }
  if (child.parentNode === null) {
    return false;
  }
  return hasAncestor(child.parentNode, parent);
};

var isOutside = function (nodeOut, nodeIn) {
  if (nodeOut === nodeIn) {
    return false;
  }
  if (hasAncestor(nodeOut, nodeIn)) {
    return false;
  }
  return true;
};

var onClickDocument = function (event) {
  Object.keys(this.clickOutsideHandlers).forEach(function (ref) {
    if (this.clickOutsideHandlers[ref].length > 0) {
      if (isOutside(event.target, this.refs[ref].getDOMNode())) {
        this.clickOutsideHandlers[ref].forEach(function (fn) {
          fn.call(this, ref);
        }.bind(this));
      }
    }
  }.bind(this));
};

module.exports = function (plugin) {

  plugin.exports = {

    setOnClickOutside: function (ref, fn) {
      if (!this.clickOutsideHandlers[ref]) {
        this.clickOutsideHandlers[ref] = [];
      }
      this.clickOutsideHandlers[ref].push(fn);
    },

    componentDidMount: function () {
      this.clickOutsideHandlers = {};
      document.addEventListener('click', onClickDocument.bind(this));
    },

    componentWillUnmount: function () {
      this.clickOutsideHandlers = {};
      document.removeEventListener('click', onClickDocument.bind(this));
    }
  };
};
