// Use bootstrap plugin.
var config = Formatic.createConfig(Formatic.plugins.bootstrap);

// Create some fields.
var fields = [
  {
    type: 'object',
    key: 'data',
    label: 'Data',
    itemFields: {
      type: 'single-line-string'
    }
  }
];

// Render the form.
React.render(
  <Formatic config={config} fields={fields} onChange={this.onChangeValue}/>
, mountNode);
