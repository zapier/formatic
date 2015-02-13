// Use bootstrap plugin.
var config = Formatic.createConfig(Formatic.plugins.bootstrap);

// Create some fields.
var fields = [
  {
    type: 'string',
    key: 'summary',
    label: 'Summary'
  },
  // text alias
  {
    type: 'text',
    key: 'description',
    label: 'Description'
  }
];

// Render the form.
React.render(
  <Formatic fields={fields} config={config}/>
, mountNode);
