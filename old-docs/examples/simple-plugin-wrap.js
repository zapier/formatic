var plugin = function (config) {

  // Need to save off existing function so we can delegate to it.
  var fieldLabel = config.fieldLabel;

  return {

    // This will become the new method for the next plugin if there is one or
    // ultimately the method available on the config if nothing overrides it.
    fieldLabel: function (field) {

      if (!field.label) {
        if (field.key) {
          return config.humanize(field.key);
        }
      }
      // Delegate to the function originally passed in above.
      return fieldLabel(field);
    }
  };
};

var config = Formatic.createConfig(Formatic.plugins.bootstrap, plugin);

// Create some fields.
var fields = [
  {
    type: 'str',
    key: 'firstName'
  },
  // unicode alias
  {
    type: 'str',
    key: 'middleName'
  },
  // str alias
  {
    type: 'str',
    key: 'lastName'
  }
];

// Render the form.
React.render(
  <Formatic fields={fields} config={config} onChange={this.onChangeValue}/>
, mountNode);
