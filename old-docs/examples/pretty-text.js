// Use bootstrap plugin.
var config = Formatic.createConfig(Formatic.plugins.bootstrap);

// Create some fields.
var fields = [
  {
    type: 'pretty-textarea',
    key: 'emailBody',
    label: 'Email Body',
    replaceChoices: [
      {
        value: 'email',
        label: 'Email Address',
        sample: 'joe@foo.com'
      },
      {
        value: 'firstName',
        label: 'First Name',
        sample: 'Joe'
      },
      {
        value: 'lastName',
        label: 'Last Name',
        sample: 'Foo'
      }
    ]
  }
];

// Render the form.
React.render(
  <Formatic config={config} fields={fields} onChange={this.onChangeValue}/>
, mountNode);
