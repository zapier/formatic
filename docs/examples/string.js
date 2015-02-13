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
    label: 'Description',
    // Number of rows.
    rows: 5
  }
];

// Render the form.
React.render(
  <Formatic config={config} fields={fields} onChange={this.onChangeValue}/>
, mountNode);
