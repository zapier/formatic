'use strict';

module.exports = function (formatic, plugin) {

  plugin.default = null;

  plugin.hidden = true;

  plugin.getValue = function (field) {
    var id = field.get('id');
    var key = field.get('key');
    if (formatic.source(id)) {
      return formatic.source(id)(field);
    }
    if (formatic.source(key)) {
      return formatic.source(key)(field);
    }
    return field.getData();
  };
};
