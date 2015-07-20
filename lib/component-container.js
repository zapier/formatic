const _ = require('./undash');

let defaultComponents = {};

const ComponentContainer = {
  setComponents(components) {
    defaultComponents = components;
  },
  components(components) {
    return _.extend({}, defaultComponents, components);
  }
};

export default ComponentContainer;
