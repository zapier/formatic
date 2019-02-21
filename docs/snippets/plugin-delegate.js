const plugin = config => {
  // Need to save off existing function so we can delegate to it.
  const fieldLabel = config.fieldLabel;

  return {
    // This will become the new method for the next plugin if there is one or
    // ultimately the method available on the config if nothing overrides it.
    fieldLabel: field => {
      if (!field.label) {
        if (field.key) {
          return config.humanize(field.key);
        }
      }
      // Delegate to the function originally passed in above.
      return fieldLabel(field);
    },
  };
};
//CUT
console.info(plugin);
//CUT
