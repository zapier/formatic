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
      var field = this.props.field;
      var tempKey = this.props.form.tempKey(this.props.field);
      var item = null;
      // if (this.refs.typeSelect) {
      //   var index = parseInt(this.refs.typeSelect.getDOMNode().value);
      //   item = field.itemTypes[index].item;
      // }
      this.props.form.actions.insert(field, tempKey, item);
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

    onDelete: function (key) {
      var lookups = this.state.lookups;
      delete lookups[key];
      this.setState({
        lookups: lookups
      });
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

      var className = formatic.className(plugin.config.className, field.className);
      var addClassName = formatic.className('object-control-add', plugin.config.addButton_className, field.addButton_className);
      var addLabel = plugin.configValue('addButton_label', '[add]');

      var sortedFields = _.sortBy(field.fields, function (field) {
        var id = this.state.lookups[field.propertyKey];
        var idNum = parseInt(id.substring(1));
        return idNum;
      }.bind(this));

      // var typeChoices = null;
      // if (field.itemTypes) {
      //   typeChoices = R.select({ref: 'typeSelect'},
      //     field.itemTypes.map(function (item, i) {
      //       return R.option({value: i}, item.label || item.type);
      //     })
      //   );
      // }

      return R.div(_.extend({className: className}, plugin.config.attributes),
        React.addons.CSSTransitionGroup({transitionName: 'reveal'},
          sortedFields.map(function (child, i) {
            if (!child) {
              return null;
            }
            return form.component({
              type: 'object-item',
              field: child,
              parent: field,
              index: i,
              propertyKey: child.propertyKey
            }, {
              key: this.state.lookups[child.propertyKey] || child.propertyKey,
              onMove: this.onMove,
              onDelete: this.onDelete
            });
          }.bind(this))
        ),
        //typeChoices,
        R.span({className: addClassName, onClick: this.onAppend}, addLabel)
      );
    }
  });
};
