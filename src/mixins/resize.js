// # resize mixin

/*
You'd think it would be pretty easy to detect when a DOM element is resized.
And you'd be wrong. There are various tricks, but none of them work very well.
So, using good ol' polling here. To try to be as efficient as possible, there
is only a single setInterval used for all elements. To use:

```js
import createReactClass from 'create-react-class';

import ResizeMixin from '@/src/mixins/resize';

export default createReactClass({

  mixins: [ResizeMixin],

  onResize: function () {
    console.log('resized!');
  },

  componentDidMount: function () {
    this.setOnResize('myText', this.onResize);
  },

  onChange: function () {
    ...
  },

  render: function () {
    return React.DOM.textarea({ref: 'myText', value: this.props.value, onChange: ...})
  }
});
```
*/

'use strict';

let id = 0;

const resizeIntervalElements = {};
let resizeIntervalElementsCount = 0;
let resizeIntervalTimer = null;

const checkElements = function() {
  Object.keys(resizeIntervalElements).forEach(function(key) {
    const element = resizeIntervalElements[key];
    if (
      element.clientWidth !== element.__prevClientWidth ||
      element.clientHeight !== element.__prevClientHeight
    ) {
      element.__prevClientWidth = element.clientWidth;
      element.__prevClientHeight = element.clientHeight;
      const handlers = element.__resizeHandlers;
      handlers.forEach(function(handler) {
        handler();
      });
    }
  }, 100);
};

const addResizeIntervalHandler = function(element, fn) {
  if (resizeIntervalTimer === null) {
    resizeIntervalTimer = setInterval(checkElements, 100);
  }
  if (!('__resizeId' in element)) {
    id++;
    element.__prevClientWidth = element.clientWidth;
    element.__prevClientHeight = element.clientHeight;
    element.__resizeId = id;
    resizeIntervalElementsCount++;
    resizeIntervalElements[id] = element;
    element.__resizeHandlers = [];
  }
  element.__resizeHandlers.push(fn);
};

const removeResizeIntervalHandlers = function(element) {
  if (!('__resizeId' in element)) {
    return;
  }
  const resizeId = element.__resizeId;
  delete element.__resizeId;
  delete element.__resizeHandlers;
  delete resizeIntervalElements[resizeId];
  resizeIntervalElementsCount--;
  if (resizeIntervalElementsCount < 1) {
    clearInterval(resizeIntervalTimer);
    resizeIntervalTimer = null;
  }
};

const onResize = function(ref, fn) {
  fn(ref);
};

export default {
  componentDidMount: function() {
    if (this.onResizeWindow) {
      window.addEventListener('resize', this.onResizeWindow);
    }
    this.resizeElementRefs = {};
  },

  componentWillUnmount: function() {
    if (this.onResizeWindow) {
      window.removeEventListener('resize', this.onResizeWindow);
    }
    Object.keys(this.resizeElementRefs).forEach(
      function(ref) {
        removeResizeIntervalHandlers(this[`${ref}Ref`]);
      }.bind(this)
    );
  },

  setOnResize: function(ref, fn) {
    if (!this.resizeElementRefs[ref]) {
      this.resizeElementRefs[ref] = true;
    }
    addResizeIntervalHandler(this[`${ref}Ref`], onResize.bind(this, ref, fn));
  },
};
