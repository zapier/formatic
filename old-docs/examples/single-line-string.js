// Use bootstrap plugin.
var config = Formatic.createConfig(Formatic.plugins.bootstrap);

// Create some fields.
var fields = [
  {
    type: 'single-line-string',
    key: 'firstName',
    label: 'First Name'
  },
  // unicode alias
  {
    type: 'unicode',
    key: 'middleName',
    label: 'Middle Name'
  },
  // str alias
  {
    type: 'str',
    key: 'lastName',
    label: 'Last Name'
  }
];

// Render the form.
React.render(
  <Formatic config={config} fields={fields} onChange={this.onChangeValue}/>
, mountNode);
