// Use bootstrap plugin.
var config = Formatic.createConfig(Formatic.plugins.bootstrap);

// Create some fields.
var fields = [
  {
    type: 'boolean',
    key: 'happy',
    label: 'Are you happy?'
  },
  {
    type: 'boolean',
    key: 'knowsSpanish',
    label: 'Do you know Spanish?',
    choices: ['si', 'no']
  }
];

// Render the form.
React.render(
  <Formatic config={config} fields={fields} onChange={this.onChangeValue}/>
, mountNode);
