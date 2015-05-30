const React = require('react');
const Config = require('../../config');

module.exports = React.createClass({

  render() {
    const config = Config.forComponent(this);

    const Label = config.helperClass('label');
    const Help = config.helperClass('help');

    return (
      <div>
        <Label {...this.props}/>
        <Help {...this.props}/>
        {this.props.children}
      </div>
    );
  }

});

// // # field component
//
// /*
// Used by any fields to put the label and help text around the field.
// */
//
// 'use strict';
//
// var React = require('react/addons');
// var R = React.DOM;
// var _ = require('../../undash');
// var cx = require('classnames');
//
// var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);
//
// module.exports = React.createClass({
//
//   displayName: 'Field',
//
//   mixins: [require('../../mixins/helper')],
//
//   getInitialState: function () {
//     return {
//       collapsed: this.props.config.fieldIsCollapsed(this.props.field) ? true : false
//     };
//   },
//
//   onClickLabel: function () {
//     this.setState({
//       collapsed: !this.state.collapsed
//     });
//   },
//
//   render: function () {
//     return this.renderWithConfig();
//   },
//
//   renderDefault: function () {
//
//     var config = this.props.config;
//
//     if (this.props.plain) {
//       return this.props.children;
//     }
//
//     var field = this.props.field;
//
//     var index = this.props.index;
//     if (!_.isNumber(index)) {
//       var key = this.props.field.key;
//       index = _.isNumber(key) ? key : undefined;
//     }
//
//     var classes = _.extend({}, this.props.classes);
//
//     var errors = config.fieldErrors(field);
//
//     errors.forEach(function (error) {
//       classes['validation-error-' + error.type] = true;
//     });
//
//     if (config.fieldIsRequired(field)) {
//       classes.required = true;
//     } else {
//       classes.optional = true;
//     }
//
//     return R.div({className: cx(classes), style: {display: (field.hidden ? 'none' : '')}},
//       config.createElement('label', {
//         config: config, field: field,
//         index: index, onClick: config.fieldIsCollapsible(field) ? this.onClickLabel : null
//       }),
//       CSSTransitionGroup({transitionName: 'reveal'},
//         this.state.collapsed ? [] : [
//           config.createElement('help', {
//             config: config, field: field,
//             key: 'help'
//           }),
//           this.props.children
//         ]
//       )
//     );
//   }
// });
