// Our new field type is mostly represented by a React class. To make it play
// well with others, there are some conventions to follow.
var Tweet = React.createClass({
  displayName: 'Tweet',

  // This mixin provides the renderWithConfig method so that this fields render
  // can be intercepted.
  mixins: [Formatic.availableMixins.field],

  getInitialState: function () {
    return {
      isValid: this.props.field.value.length <= 140
    };
  },

  // The mixin also provides an onChangeValue method that appropriately
  // intercepts value changes.
  onChange: function (event) {
    this.onChangeValue(event.target.value);
    var isValid = true;
    if (event.target.value.length > 140) {
      isValid = false;
    }
    this.setState({
      isValid: isValid
    });
  },

  // Let render be intercepted.
  render: function () {
    return this.renderWithConfig();
  },

  // Render the default view for this type.
  renderDefault: function () {
    return this.props.config.createElement('field', {
      field: this.props.field, plain: this.props.plain
    },
      <textarea
        style={{color: (this.state.isValid ? null : 'red')}}
        className='form-control'
        value={this.props.field.value}
        onChange={this.onChange}
        onFocus={this.onFocusAction}
        onBlur={this.onBlurAction}
      />
    );

  }
});

// Here's our plugin for adding our new type.
var tweetFieldTypePlugin = function (config) {

  return {
    createElement_Tweet: React.createFactory(Tweet),

    // This extra stuff is optional. Your type will start working with just the
    // above factory. It will default to same stuff as a String type.

    // Default value for this type if none is given.
    createDefaultValue_Tweet: '',

    // If you want to coerce the value to something if it's the wrong type.
    coerceValue_Tweet: function (fieldTemplate, value) {
      // Just delegate to coercion for String type.
      return config.coerceValue_String(fieldTemplate, value);
    }
  };
};

var config = Formatic.createConfig(Formatic.plugins.bootstrap, tweetFieldTypePlugin);

// Create some fields.
var fields = [
  {
    type: 'tweet',
    key: 'myTweet',
    label: 'My Tweet'
  }
];

var value = {
  myTweet: 'This is a pretty long post but not quite 140 characters. Keep typing a few more words and see if the text color changes to red.'
};

// Render the form.
React.render(
  <Formatic fields={fields} defaultValue={value} config={config} onChange={this.onChangeValue}/>
, mountNode);
