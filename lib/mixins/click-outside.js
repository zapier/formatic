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

var _ = require('underscore');

var hasAncestor = function (child, parent) {
  if (child.parentNode === parent) {
    return true;
  }
  if (child.parentNode === null) {
    return false;
  }
  return hasAncestor(child.parentNode, parent);
};

module.exports = function (plugin) {

  plugin.exports = {

    // _onClickDocument: function(event) {
    //   console.log('click doc')
    //   if (this._didMouseDown) {
    //     _.each(this.clickOutsideHandlers, function (funcs, ref) {
    //       if (isOutside(event.target, this.refs[ref].getDOMNode())) {
    //         funcs.forEach(function (fn) {
    //           fn.call(this);
    //         }.bind(this));
    //       }
    //     }.bind(this));
    //   }
    // },

    isNodeOutside: function (nodeOut, nodeIn) {
      if (nodeOut === nodeIn) {
        return false;
      }
      if (hasAncestor(nodeOut, nodeIn)) {
        return false;
      }
      return true;
    },

    isNodeInside: function (nodeIn, nodeOut) {
      return !this.isNodeOutside(nodeIn, nodeOut);
    },

    _onClickMousedown: function() {
      //this._didMouseDown = true;
      _.each(this.clickOutsideHandlers, function (funcs, ref) {
        if (this.refs[ref]) {
          this._mousedownRefs[ref] = true;
        }
      }.bind(this));
    },

    _onClickMouseup: function (event) {
      _.each(this.clickOutsideHandlers, function (funcs, ref) {
        if (this.refs[ref] && this._mousedownRefs[ref]) {
          if (this.isNodeOutside(event.target, this.refs[ref].getDOMNode())) {
            funcs.forEach(function (fn) {
              fn.call(this, event);
            }.bind(this));
          }
        }
        this._mousedownRefs[ref] = false;
      }.bind(this));
    },

    // _onClickDocument: function () {
    //   console.log('clickety')
    //   _.each(this.clickOutsideHandlers, function (funcs, ref) {
    //     console.log('clickety', ref, this.refs[ref])
    //   }.bind(this));
    // },

    setOnClickOutside: function (ref, fn) {
      if (!this.clickOutsideHandlers[ref]) {
        this.clickOutsideHandlers[ref] = [];
      }
      this.clickOutsideHandlers[ref].push(fn);
    },

    componentDidMount: function () {
      this.clickOutsideHandlers = {};
      this._didMouseDown = false;
      document.addEventListener('mousedown', this._onClickMousedown);
      document.addEventListener('mouseup', this._onClickMouseup);
      //document.addEventListener('click', this._onClickDocument);
      this._mousedownRefs = {};
    },

    componentWillUnmount: function () {
      this.clickOutsideHandlers = {};
      //document.removeEventListener('click', this._onClickDocument);
      document.removeEventListener('mouseup', this._onClickMouseup);
      document.removeEventListener('mousedown', this._onClickMousedown);
    }
  };
};
