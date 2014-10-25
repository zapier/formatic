'use strict';

module.exports = function (plugin) {

  var propModifiers = {};

  var addPropModifier = function (name, modifyFn) {
    if (!propModifiers[name]) {
      propModifiers[name] = [];
    }
    propModifiers[name].push(modifyFn);
  };

  var propsPlugins = plugin.requireAll(plugin.config.props);

  propsPlugins.forEach(function (plugin) {
    addPropModifier.apply(null, plugin);
  });

  var componentFactories = {};

  plugin.exports.component = function (name) {

    if (!componentFactories[name]) {
      var component = plugin.require('component.' + name).component;
      componentFactories[name] = function (props, children) {
        if (propModifiers[name]) {
          propModifiers[name].forEach(function (modify) {
            var result = modify(props);
            if (result) {
              props = result;
            }
          });
        }
        return component(props, children);
      };
    }
    return componentFactories[name];
  };
};
