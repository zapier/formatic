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
          fn.call(this);
        });
      }
    }
  }.bind(this));
};

module.exports = {

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
