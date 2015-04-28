var plugin = function (config) {

  return {
    fieldLabel: function (field) {
      if (!field.label) {
        if (field.key) {
          return config.humanize(field.key);
        }
      }
      return field.label;
    }
  };
};
