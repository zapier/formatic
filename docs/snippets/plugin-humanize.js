const plugin = config => {
  return {
    fieldLabel: field => {
      if (!field.label) {
        if (field.key) {
          return config.humanize(field.key);
        }
      }
      return field.label;
    },
  };
};
//CUT
console.info(plugin);
//CUT
