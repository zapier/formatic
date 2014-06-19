'use strict';

var React = require('react');
var R = React.DOM;

module.exports = React.createClass({

  render: function () {
    return R.div({key: this.props.field.key},
      R.label({},
        this.props.field.label
      ),
      R.select({onChange: this.props.onChange, name: this.props.field.key, value: this.props.field.value},
        this.props.field.choices.map(function (choice) {
          return R.option({
            value: choice.value
          }, choice.label);
        }.bind(this))
      )
    );
  }
});
