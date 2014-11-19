// # compilers.prop-aliases

/*
Alias some properties to other properties.
*/

'use strict';

module.exports = function (plugin) {

  var propAliases = {
    help_text: 'helpText'
  };

  plugin.exports.compile = function (def) {
    Object.keys(propAliases).forEach(function (alias) {
      var propName = propAliases[alias];
      if (typeof def[propName] === 'undefined' && typeof def[alias] !== 'undefined') {
        def[propName] = def[alias];
      }
    });
  };
};
