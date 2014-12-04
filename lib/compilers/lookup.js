// # compiler.lookup

/*
Convert a lookup declaration to an evaluation. A lookup property is used like:

```js
{
  type: 'string',
  key: 'states',
  lookup: {source: 'locations', keys: ['country']}
}
```

Logically, the above will use the `country` key of the value to ask the
`locations` source for states choices. This works by converting the lookup to
the following evaluation.

```js
{
  type: 'string',
  key: 'states',
  choices: [],
  eval: {
    needsSource: [
      ['@if', ['@getCachedSource', 'locations', {country: ['@get', 'country']}], null, ['locations', {country: ['@get', 'country']}]]
    ],
    choices: ['@getCachedSource', 'locations', {country: ['@get', 'country']}]
  }
}
```

The above says to add a `needsSource` property if necessary and add a `choices`
array if it's available. Otherwise, choices will default to an empty array.
*/

'use strict';

module.exports = function (plugin) {

  var addLookup = function (def, lookupPropName, choicesPropName) {
    var lookup = def[lookupPropName];

    if (lookup) {
      if (!def[choicesPropName]) {
        def[choicesPropName] = [];
      }
      if (!def.eval) {
        def.eval = {};
      }
      if (!def.eval.needsSource) {
        def.eval.needsSource = [];
      }
      if (!def.eval.refreshMeta) {
        def.eval.refreshMeta = [];
      }
      var keys = lookup.keys || [];
      var params = {};
      var metaArgs, metaGet, metaHasError, hiddenTest;

      if (lookup.group) {

        keys.forEach(function (key) {
          params[key] = ['@get', 'item', key];
        });
        metaArgs = [lookup.source].concat(params);
        metaGet = ['@getCachedSource'].concat(metaArgs);
        var metaForEach = ['@forEach', 'item', ['@getGroupValues', lookup.group]];
        def.eval.needsSource.push(metaForEach.concat([
          metaArgs,
          ['@not', metaGet]
        ]));
        hiddenTest = ['@and'].concat(keys.map(function (key) {
          return ['@get', 'item', key];
        }));
        def.eval[choicesPropName] = metaForEach.concat([
          ['@or', metaGet, ['@if', hiddenTest, ['///loading///'], []]],
          ['@or', hiddenTest, metaGet]
        ]);
      } else {
        keys.forEach(function (key) {
          params[key] = ['@get', key];
        });
        metaArgs = [lookup.source].concat(params);
        metaGet = ['@getCachedSource'].concat(metaArgs);
        metaHasError = ['@hasMetaError'].concat(metaArgs);
        var metaGetOrLoading = ['@if', metaHasError, ['///error///'], ['@or', metaGet, ['///loading///']]];
        def.eval.needsSource.push(['@if', metaGet, null, metaArgs]);
        def.eval.refreshMeta.push(metaArgs);
        def.eval[choicesPropName] = metaGetOrLoading;
        if (keys.length > 0) {
          // Test that we have all needed keys.
          hiddenTest = ['@and'].concat(keys.map(function (key) {
            return ['@get', key];
          }));
          // Reverse test so we hide if don't have all keys.
          hiddenTest = ['@not', hiddenTest];
          if (!def.eval.hidden) {
            def.eval.hidden = hiddenTest;
          }
        }
      }

      delete def[lookupPropName];
    }
  };

  plugin.exports.compile = function (def) {

    addLookup(def, 'lookup', 'choices');
    addLookup(def, 'lookupReplacements', 'replaceChoices');
  };
};
