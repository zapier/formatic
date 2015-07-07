// # Choices component

/*
Render customized (non-native) dropdown choices.
*/

'use strict';

var React = require('react/addons');
var R = React.DOM;
var _ = require('underscore');

var magicChoiceRe = /^\/\/\/[^\/]+\/\/\/$/;

module.exports = React.createClass({

  displayName: 'Choices',

  mixins: [
    require('../../mixins/helper'),
    //plugin.require('mixin.resize'),
    //plugin.require('mixin.scroll'),
    require('../../mixins/click-outside')
  ],

  getInitialState: function () {
    return {
      maxHeight: null,
      open: this.props.open
    };
  },

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
        this.onClose();
      }
    }.bind(this));

    this.adjustSize();
  },

  onSelect: function (choice, event) {
    this.setState({openSection: null});
    this.props.onSelect(choice.value, event);
  },

  onChoiceAction: function (choice) {
    this.setState({openSection: null});
    this.props.onChoiceAction(choice);
  },

  onClose: function () {
    this.setState({openSection: null});
    this.props.onClose();
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
    var nextState = {
      open: nextProps.open
    };

    this.setState(nextState, function () {
      this.adjustSize();
    }.bind(this));
  },

  onScroll: function () {
    // console.log('stop that!')
    // event.preventDefault();
    // event.stopPropagation();
  },

  onWheel: function () {
    // event.preventDefault();
    // event.stopPropagation();
  },

  onHeaderClick: function (choice) {
    if (this.state.openSection === choice.sectionKey) {
      this.setState({openSection: null});
    } else {
      this.setState({openSection: choice.sectionKey}, this.adjustSize);
    }
  },

  hasOneSection: function () {
    var sectionHeaders = this.props.choices.filter(function (c) { return c.sectionKey; });
    return sectionHeaders.length === 1;
  },

  visibleChoices: function () {
    var choices = this.props.choices;

    if (choices && choices.length === 0) {
      return [{value: '///empty///'}];
    }
    if (!this.props.isAccordion) {
      return choices;
    }

    var openSection = this.state.openSection;
    var alwaysExanded = this.hasOneSection();
    var visibleChoices = [];
    var inSection;

    choices.forEach(function (choice) {
      if (choice.value && choice.value.match(magicChoiceRe)) {
        visibleChoices.push(choice);
      }
      if (choice.sectionKey) {
        inSection = choice.sectionKey === openSection;
      }
      if (alwaysExanded || choice.sectionKey || inSection) {
        visibleChoices.push(choice);
      }
    });
    return visibleChoices;
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;

    var choices = this.visibleChoices();

    if (this.props.open) {
      return R.div({ref: 'container', onWheel: this.onWheel, onScroll: this.onScroll,
                    className: 'choices-container', style: {
        userSelect: 'none', WebkitUserSelect: 'none', position: 'absolute',
        maxHeight: this.state.maxHeight ? this.state.maxHeight : null
      }},
        config.cssTransitionWrapper(
          R.ul({ref: 'choices', className: 'choices'},
            choices.map(function (choice, i) {

              var choiceElement = null;

              if (choice.value === '///loading///') {
                choiceElement = R.a({href: 'JavaScript' + ':', onClick: this.onClose},
                  R.span({className: 'choice-label'},
                    config.createElement('loading-choice', {field: this.props.field})
                  )
                );
              } else if (choice.value === '///empty///') {
                choiceElement = R.a({href: 'JavaScript' + ':', onClick: this.onClose},
                  R.span({className: 'choice-label'},
                    'No choices available.'
                  )
                );
              } else if (choice.action) {
                var labelClasses = 'choice-label ' + choice.action;

                choiceElement = R.a({href: 'JavaScript' + ':', onClick: this.onChoiceAction.bind(this, choice)},
                  R.span({className: labelClasses},
                    choice.label || this.props.config.actionChoiceLabel(choice.action)
                  ),
                  this.props.config.createElement('choice-action-sample', {action: choice.action, choice: choice})
                );
              } else if (choice.sectionKey) {
                choiceElement = R.a({href: 'JavaScript' + ':', onClick: this.onHeaderClick.bind(this, choice)},
                  config.createElement('choice-section-header', {choice: choice})
                );
              }
              else {
                choiceElement = R.a({href: 'JavaScript' + ':', onClick: this.onSelect.bind(this, choice)},
                  R.span({className: 'choice-label'},
                    choice.label
                  ),
                  R.span({className: 'choice-sample'},
                    choice.sample
                  )
                );
              }

              return R.li({key: i, className: 'choice'},
                choiceElement
              );
            }.bind(this))
          )
        )
      );
    }

    // not open
    return null;
  }
});
