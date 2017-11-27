// React 16 needs `requestAnimationFrame` to work properly
global.requestAnimationFrame = function(callback) {
  setTimeout(callback, 0);
};
