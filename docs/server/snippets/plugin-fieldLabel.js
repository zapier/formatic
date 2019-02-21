const plugin = () => {
  return {
    fieldLabel: field => {
      if (!field.label) {
        return field.key;
      }
      return field.label;
    },
  };
};
//CUT
console.info(plugin);
//CUT
