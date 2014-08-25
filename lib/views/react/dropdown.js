'use strict';

var React = require('react/addons');
var R = React.DOM;
var _ = require('underscore');

module.exports = function (formatic, config) {

  config = config || {};

  var className = 'dropdown-field';
  if (config.className) {
    className += ' ' + config.className;
  }

  var view = React.createClass({

    mixins: [require('./mixins/click-outside'), require('./mixins/resize')],

    getInitialState: function () {
      return {
        open: false
      };
    },

    onToggle: function () {
      this.setState({open: !this.state.open});
    },

    onClose: function () {
      this.setState({open: false});
    },

    fixChoicesWidth: function () {
      this.setState({
        choicesWidth: this.refs.active.getDOMNode().offsetWidth
      });
    },

    onResizeWindow: function () {
      this.fixChoicesWidth();
    },

    componentDidMount: function () {
      this.fixChoicesWidth();
      this.setOnClickOutside('select', this.onClose);
    },

    render: function () {
      var selectedLabel = '';
      var matchingLabels = this.props.field.choices.filter(function (choice) {
        return choice.value === this.props.field.value;
      }.bind(this));
      if (matchingLabels.length > 0) {
        selectedLabel = matchingLabels[0].label;
      }
      selectedLabel = selectedLabel || '\u00a0';

      return R.div(_.extend({className: className, ref: 'select'}, config.attributes),
        R.div({className: 'field-value', ref: 'active', onClick: this.onToggle}, selectedLabel),
        R.div({className: 'field-toggle ' + (this.state.open ? 'field-open' : 'field-closed'), onClick: this.onToggle}),
        React.addons.CSSTransitionGroup({transitionName: 'reveal'},
          this.state.open ? R.ul({ref: 'choices', className: 'field-choices', style: {width: this.state.choicesWidth}},
            this.props.field.choices.map(function (choice) {
              return R.li({
                className: 'field-choice',
                onClick: function () {
                  this.setState({open: false});
                  this.props.form.actions.change(this.props.field, choice.value);
                }.bind(this)
              }, choice.label);
            }.bind(this))
          ) : []
        )
      );
    }
  });

  formatic.view(config.type, view);
};
