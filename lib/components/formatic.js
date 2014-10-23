'use strict';

var React = require('react/addons');
var R = React.DOM;
var Reflux = require('reflux');

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

    mixins: [Reflux.ListenerMixin],

    getInitialState: function () {
      return {
        field: this.props.form.field()
      };
    },

    componentDidMount: function() {
      var form = this.props.form;
      this.listenTo(form.store, this.onFormChanged);
    },

    onFormChanged: function () {
      this.setState({
        field: this.props.form.field()
      });
    },

    render: function () {
      return R.div({className: 'formatic'},
        this.state.field.component()
      );
    }
  });
};
