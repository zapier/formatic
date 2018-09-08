// Use bootstrap plugin.
var config = Formatic.createConfig(Formatic.plugins.bootstrap);

// Create some fields.
var fields = [
  {
    type: 'fields',
    key: 'address',
    label: 'Address',
    fields: [
      {
        type: 'single-line-string',
        key: 'street',
        label: 'Street'
      },
      {
        type: 'single-line-string',
        key: 'city',
        label: 'City'
      },
      {
        type: 'single-line-string',
        key: 'state',
        label: 'State'
      }
    ]
  }
];

// Render the form.
React.render(
  <Formatic config={config} fields={fields} onChange={this.onChangeValue}/>
, mountNode);
