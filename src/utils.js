// # utils

/*
Just some shared utility functions.
*/

'use strict';

import _ from '@/src/undash';
import ReactDOM from 'react-dom';

const utils = {};

// Copy obj recursing deeply.
utils.deepCopy = function(obj) {
  if (_.isArray(obj)) {
    return obj.map(function(item) {
      return utils.deepCopy(item);
    });
  } else if (_.isFunction(obj)) {
    return obj;
  } else if (_.isNull(obj)) {
    return obj;
  } else if (_.isObject(obj)) {
    const copy = {};
    _.each(obj, function(value, key) {
      copy[key] = utils.deepCopy(value);
    });
    return copy;
  } else {
    return obj;
  }
};

// Cache for strings converted to Pascal Case. This should be a finite list, so
// not much fear that we will run out of memory.
const dashToPascalCache = {};

// Convert foo-bar to FooBar.
utils.dashToPascal = function(s) {
  if (s === '') {
    return '';
  }
  if (!dashToPascalCache[s]) {
    dashToPascalCache[s] = s
      .split('-')
      .map(function(part) {
        return part[0].toUpperCase() + part.substring(1);
      })
      .join('');
  }
  return dashToPascalCache[s];
};

// Copy all computed styles from one DOM element to another.
utils.copyElementStyle = function(fromElement, toElement) {
  const fromStyle = window.getComputedStyle(fromElement, '');

  if (fromStyle.cssText !== '') {
    toElement.style.cssText = fromStyle.cssText;
    return;
  }

  const cssRules = [];
  for (let i = 0; i < fromStyle.length; i++) {
    cssRules.push(
      fromStyle[i] + ':' + fromStyle.getPropertyValue(fromStyle[i]) + ';'
    );
  }
  const cssText = cssRules.join('');

  toElement.style.cssText = cssText;
};

// Object to hold browser sniffing info.
const browser = {
  isChrome: false,
  isMozilla: false,
  isOpera: false,
  isIe: false,
  isSafari: false,
  isUnknown: false,
};

// Sniff the browser.
let ua = '';

if (typeof navigator !== 'undefined') {
  ua = navigator.userAgent;
}

if (ua.indexOf('Chrome') > -1) {
  browser.isChrome = true;
} else if (ua.indexOf('Safari') > -1) {
  browser.isSafari = true;
} else if (ua.indexOf('Opera') > -1) {
  browser.isOpera = true;
} else if (ua.indexOf('Firefox') > -1) {
  browser.isMozilla = true;
} else if (ua.indexOf('MSIE') > -1) {
  browser.isIe = true;
} else {
  browser.isUnknown = true;
}

// Export sniffed browser info.
utils.browser = browser;

// Create a method that delegates to another method on the same object. The
// default configuration uses this function to delegate one method to another.
utils.delegateTo = function(name) {
  return function() {
    return this[name].apply(this, arguments);
  };
};

utils.delegator = function(obj) {
  return function(name) {
    return function() {
      return obj[name].apply(obj, arguments);
    };
  };
};

utils.capitalize = function(s) {
  return s.charAt(0).toUpperCase() + s.substring(1).toLowerCase();
};

export const keyCodes = (utils.keyCodes = {
  UP: 38,
  DOWN: 40,
  ENTER: 13,
  ESC: 27,
  '[': 219,
  SHIFT: 16,
});

// utils.scrollIntoViewIfOutside = (node, container) => {
//   if (node && container) {
//     const nodeRect = node.getBoundingClientRect();
//     const containerRect = container.getBoundingClientRect();
//     if (nodeRect.bottom > containerRect.bottom || nodeRect.top < containerRect.top) {
//       node.scrollIntoView(false);
//     }
//   }
// };

export const scrollIntoContainerView = (utils.scrollIntoContainerView = (
  node,
  container
) => {
  if (node && container) {
    const nodeRect = node.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    let offset = 0;
    if (nodeRect.bottom > containerRect.bottom) {
      offset = nodeRect.bottom - containerRect.bottom;
    } else if (nodeRect.top < containerRect.top) {
      offset = nodeRect.top - containerRect.top;
    }
    if (offset !== 0) {
      container.scrollTop = container.scrollTop + offset;
    }
  }
});

export const focusRefNode = (utils.focusRefNode = ref => {
  if (ref) {
    const node = ReactDOM.findDOMNode(ref);
    node.focus();
  }
});

export const ref = (utils.ref = (component, key) => node => {
  component[`${key}Ref`] = node;
});

export const argumentsToArray = (args, startIndex = 0, array) => {
  if (!array) {
    array = [];
  }
  const insertIndex = array.length;
  const argsLengthToGet = args.length - startIndex;

  for (let i = 0; i < argsLengthToGet; i++) {
    array[i + insertIndex] = args[i + startIndex];
  }
  return array;
};

export default utils;
