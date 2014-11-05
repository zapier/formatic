'use strict';

module.exports = function (plugin) {

  plugin.exports.compile = function (def) {
    if (def.lookup) {
      if (!def.eval) {
        def.eval = {};
      }
      if (!def.eval.needsMeta) {
        def.eval.needsMeta = [];
      }
      var keys = def.lookup.keys || [];
      var metaKeys = keys.map(function (key) {
        return ['@get', key];
      });
      metaKeys = [def.lookup.source].concat(metaKeys);
      var metaGet = ['@getMeta'].concat(metaKeys);
      def.eval.needsMeta.push(['@if', metaGet, null, metaKeys]);
      def.eval.choices = metaGet;
      delete def.lookup;
    }
  };
};
