// Use bootstrap plugin.
var config = Formatic.createConfig(Formatic.plugins.bootstrap);

// Create some fields.
var fields = [
  {
    type: 'select',
    key: 'browser',
    label: 'Browser',
    choices: [
      {
        value: 'chrome',
        label: 'Chrome'
      },
      {
        value: 'ie',
        label: 'IE'
      },
      {
        value: 'firefox',
        label: 'FireFox'
      },
      {
        value: 'safari',
        label: 'Safari'
      },
      {
        value: 'opera',
        label: 'Opera'
      }
    ]
  }
];

// Render the form.
React.render(
  <Formatic config={config} fields={fields} onChange={this.onChangeValue}/>
, mountNode);
