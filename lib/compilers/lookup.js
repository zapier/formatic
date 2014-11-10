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
    needsMeta: [
      ['@if', ['@getMeta', 'locations', ['@get', 'country']], null, ['locations', ['@get', 'country']]]
    ],
    choices: ['@getMeta', 'locations', ['@get', 'country']]
  }
}
```

The above says to add a `needsMeta` property if necessary and add a `choices`
array if it's available. Otherwise, choices will default to an empty array.
*/

'use strict';

module.exports = function (plugin) {

  plugin.exports.compile = function (def) {
    if (def.lookup) {
      if (!def.choices) {
        def.choices = [];
      }
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
