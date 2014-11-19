'use strict';

var React = require('react/addons');
var R = React.DOM;
var _ = require('underscore');

var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    mixins: [
      //plugin.require('mixin.resize'),
      //plugin.require('mixin.scroll'),
      plugin.require('mixin.click-outside')
    ],

    getInitialState: function () {
      return {
        maxHeight: null,
        open: this.props.open
      };
    },
    //
    // onToggle: function () {
    //   this.setState({open: !this.state.open});
    // },
    //
    // onClose: function () {
    //   this.setState({open: false});
    // },
    //
    // fixChoicesWidth: function () {
    //   this.setState({
    //     choicesWidth: this.refs.active.getDOMNode().offsetWidth
    //   });
    // },
    //
    // onResizeWindow: function () {
    //   this.fixChoicesWidth();
    // },

    // componentDidMount: function () {
    //   this.fixChoicesWidth();
    //   this.setOnClickOutside('select', this.onClose);
    // },

    getIgnoreCloseNodes: function () {
      if (!this.props.ignoreCloseNodes) {
        return [];
      }
      var nodes = this.props.ignoreCloseNodes();
      if (!_.isArray(nodes)) {
        nodes = [nodes];
      }
      return nodes;
    },

    componentDidMount: function () {
      this.setOnClickOutside('choices', function (event) {

        // Make sure we don't find any nodes to ignore.
        if (!_.find(this.getIgnoreCloseNodes(), function (node) {
          return this.isNodeInside(event.target, node);
        }.bind(this))) {
          this.props.onClose();
        }
      }.bind(this));

      this.adjustSize();
    },

    onSelect: function (choice) {
      this.props.onSelect(choice.value);
    },

    onResizeWindow: function () {
      this.adjustSize();
    },

    onScrollWindow: function () {
      this.adjustSize();
    },

    adjustSize: function () {
      if (this.refs.choices) {
        var node = this.refs.choices.getDOMNode();
        var rect = node.getBoundingClientRect();
        var top = rect.top;
        var windowHeight = window.innerHeight;
        var height = windowHeight - top;
        this.setState({
          maxHeight: height
        });
      }
    },

    componentWillReceiveProps: function (nextProps) {
      this.setState({open: nextProps.open}, function () {
        this.adjustSize();
      }.bind(this));
    },

    onScroll: function (event) {
      // console.log('stop that!')
      // event.preventDefault();
      // event.stopPropagation();
    },

    onWheel: function (event) {
      // event.preventDefault();
      // event.stopPropagation();
    },

    render: function () {

      return R.div({ref: 'container', onWheel: this.onWheel, onScroll: this.onScroll, className: 'choices-container', style: {
        userSelect: 'none', WebkitUserSelect: 'none', position: 'absolute',
        maxHeight: this.state.maxHeight ? this.state.maxHeight : null
      }},
        CSSTransitionGroup({transitionName: 'reveal'},
          this.props.open ? R.ul({ref: 'choices', className: 'choices'},
            this.props.choices.map(function (choice, i) {
              return R.li({key: i, className: 'choice'},
                choice.value === '///loading///' ?
                  R.a({href: 'JavaScript' + ':', onClick: this.props.onClose},
                    R.span({className: 'choice-label'},
                      'Loading...'
                    )
                  ) :
                  R.a({href: 'JavaScript' + ':', onClick: this.onSelect.bind(this, choice)},
                    R.span({className: 'choice-label'},
                      choice.label
                    ),
                    R.span({className: 'choice-sample'},
                      choice.sample
                    )
                  )
              );
            }.bind(this))
          ) : null
        )
      );


      // var className = formatic.className('dropdown-field', plugin.config.className, this.props.field.className);
      //
      // var selectedLabel = '';
      // var matchingLabels = this.props.field.choices.filter(function (choice) {
      //   return choice.value === this.props.field.value;
      // }.bind(this));
      // if (matchingLabels.length > 0) {
      //   selectedLabel = matchingLabels[0].label;
      // }
      // selectedLabel = selectedLabel || '\u00a0';
      //
      // return R.div(_.extend({className: className, ref: 'select'}, plugin.config.attributes),
      //   R.div({className: 'field-value', ref: 'active', onClick: this.onToggle}, selectedLabel),
      //   R.div({className: 'field-toggle ' + (this.state.open ? 'field-open' : 'field-closed'), onClick: this.onToggle}),
      //   React.addons.CSSTransitionGroup({transitionName: 'reveal'},
      //     R.div({className: 'field-choices-container'},
      //       this.state.open ? R.ul({ref: 'choices', className: 'field-choices', style: {width: this.state.choicesWidth}},
      //         this.props.field.choices.map(function (choice) {
      //           return R.li({
      //             className: 'field-choice',
      //             onClick: function () {
      //               this.setState({open: false});
      //               this.props.form.actions.change(this.props.field, choice.value);
      //             }.bind(this)
      //           }, choice.label);
      //         }.bind(this))
      //       ) : []
      //     )
      //   )
      // );
    }
  });
};


// componentDidMount: function () {
//   this.setOnClickOutside('choices', function (event) {
//
//     // Make sure we don't find any nodes to ignore.
//     if (!_.find(this.getIgnoreCloseNodes(), function (node) {
//       console.log(node, event.target)
//       return !this.isNodeOutside(node, event.target);
//     }.bind(this))) {
//       console.log("how???")
//       this.props.onClose();
//     }
//   }.bind(this));
// },
//
// onSelect: function (choice) {
//   this.props.onSelect(choice.value);
// },
//
// render: function () {
//
//   return R.div({ref: 'container', className: 'choices-container', style: {userSelect: 'none', WebkitUserSelect: 'none', position: 'absolute'}},
//     this.props.open ?
//       CSSTransitionGroup({transitionName: 'reveal'},
//         R.ul({ref: 'choices', className: 'choices'},
//           this.props.choices.map(function (choice, i) {
//             return R.li({key: i, className: 'choice'},
//               R.a({href: 'JavaScript:' + '', onClick: this.onSelect.bind(this, choice)},
//                 R.span({className: 'choice-label'},
//                   choice.label
//                 ),
//                 R.span({className: 'choice-sample'},
//                   choice.sample
//                 )
//               )
//             );
//           }.bind(this))
//         )
//       )
//       : null
//   );
