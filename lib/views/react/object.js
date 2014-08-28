'use strict';

var React = require('react');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.view = React.createClass({

    getInitialState: function () {
      var nextId = 0;
      var lookups = {};
      this.props.field.fields.forEach(function (field) {
        lookups[field.propertyKey] = '_' + nextId;
        nextId++;
      });
      return {
        lookups: lookups,
        nextId: nextId
      };
    },

    onAppend: function () {
      var tempKey = this.props.form.tempKey(this.props.field);
      this.props.form.actions.insert(this.props.field, tempKey);
    },

    onMove: function (fromKey, toKey) {
      if (fromKey !== toKey) {
        var lookups = this.state.lookups;

        if (lookups[fromKey]) {
          var prevKey = fromKey;
          fromKey = lookups[fromKey];
          delete lookups[prevKey];
        }

        lookups[toKey] = fromKey;

        this.setState({
          lookups: lookups
        });
      }
    },

    componentWillReceiveProps: function (newProps) {
      var nextId = this.state.nextId;
      var lookups = this.state.lookups;
      newProps.field.fields.forEach(function (field) {
        if (!lookups[field.propertyKey]) {
          lookups[field.propertyKey] = '_' + nextId;
          nextId++;
        }
      });
      this.setState({
        lookups: lookups,
        nextId: nextId
      });
    },

    render: function () {
      var field = this.props.field;
      var form = this.props.form;

      var className = plugin.config.className || '';

      console.log(this.state.lookups);
      console.log(this.state.usedKeys);

      return R.div(_.extend({className: className}, plugin.config.attributes),
        field.fields.map(function (child, i) {
          return form.component({
            type: 'object-item',
            field: child,
            parent: field,
            index: i,
            propertyKey: child.propertyKey
          }, {
            key: this.state.lookups[child.propertyKey] || child.propertyKey,
            onMove: this.onMove
          });
        }.bind(this)),
        R.span({className: 'object-control-add', onClick: this.onAppend}, '[add]')
      );
    }
  });
};
