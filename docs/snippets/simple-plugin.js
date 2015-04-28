var plugin = function (config) {

  return {
    fieldLabel: function (field) {
      if (!field.label) {
        return field.key;
      }
      return field.label;
    }
  };
};
