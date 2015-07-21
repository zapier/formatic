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

  mixins: [require('../../mixins/helper'),
  //plugin.require('mixin.resize'),
  //plugin.require('mixin.scroll'),
  require('../../mixins/click-outside')],

  getInitialState: function getInitialState() {
    return {
      maxHeight: null,
      open: this.props.open,
      searchString: ''
    };
  },

  getIgnoreCloseNodes: function getIgnoreCloseNodes() {
    if (!this.props.ignoreCloseNodes) {
      return [];
    }
    var nodes = this.props.ignoreCloseNodes();
    if (!_.isArray(nodes)) {
      nodes = [nodes];
    }
    return nodes;
  },

  componentDidMount: function componentDidMount() {
    this.setOnClickOutside('container', (function (event) {

      // Make sure we don't find any nodes to ignore.
      if (!_.find(this.getIgnoreCloseNodes(), (function (node) {
        return this.isNodeInside(event.target, node);
      }).bind(this))) {
        this.onClose();
      }
    }).bind(this));

    this.adjustSize();
  },

  onSelect: function onSelect(choice, event) {
    this.setState({
      openSection: null,
      searchString: ''
    });
    this.props.onSelect(choice.value, event);
  },

  onChoiceAction: function onChoiceAction(choice) {
    this.setState({
      openSection: null,
      searchString: ''
    });
    this.props.onChoiceAction(choice);
  },

  onClose: function onClose() {
    this.setState({
      openSection: null,
      searchString: ''
    });
    this.props.onClose();
  },

  onResizeWindow: function onResizeWindow() {
    this.adjustSize();
  },

  onScrollWindow: function onScrollWindow() {
    this.adjustSize();
  },

  adjustSize: function adjustSize() {
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

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var nextState = {
      open: nextProps.open
    };

    this.setState(nextState, (function () {
      this.adjustSize();
    }).bind(this));
  },

  onScroll: function onScroll() {},

  onWheel: function onWheel() {},

  onHeaderClick: function onHeaderClick(choice) {
    if (this.state.openSection === choice.sectionKey) {
      this.setState({ openSection: null });
    } else {
      this.setState({ openSection: choice.sectionKey }, this.adjustSize);
    }
  },

  hasOneSection: function hasOneSection() {
    var sectionHeaders = this.props.choices.filter(function (c) {
      return c.sectionKey;
    });
    return sectionHeaders.length === 1;
  },

  visibleChoices: function visibleChoices() {
    var _this = this;

    var choices = this.props.choices;

    if (choices && choices.length === 0) {
      return [{ value: '///empty///' }];
    }

    if (this.state.searchString) {
      choices = choices.filter(function (choice) {
        if (choice.sectionKey) {
          return true;
        }
        return choice.label && choice.label.toLowerCase().indexOf(_this.state.searchString.toLowerCase()) > -1;
      });
    }

    if (!this.props.isAccordion) {
      return choices;
    }

    var openSection = this.state.openSection;
    var alwaysExanded = this.hasOneSection() || this.state.searchString;
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

  render: function render() {
    return this.renderWithConfig();
  },

  onClick: function onClick(event) {
    // swallow clicks
    event.stopPropagation();
  },

  onChangeSearch: function onChangeSearch(event) {
    this.setState({
      searchString: event.target.value
    });
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;

    var choices = this.visibleChoices();

    if (this.props.open) {
      return R.div({ ref: 'container', onWheel: this.onWheel, onScroll: this.onScroll, onClick: this.onClick,
        className: 'choices-container', style: {
          userSelect: 'none', WebkitUserSelect: 'none', position: 'absolute',
          maxHeight: this.state.maxHeight ? this.state.maxHeight : null
        } }, config.cssTransitionWrapper(R.div({ key: 'search', className: 'choices-search' }, R.input({ type: 'text', placeholder: 'Search...', onChange: this.onChangeSearch })), R.ul({ key: 'choices', ref: 'choices', className: 'choices' }, choices.map((function (choice, i) {

        var choiceElement = null;

        if (choice.value === '///loading///') {
          choiceElement = R.a({ href: 'JavaScript' + ':', onClick: this.onClose }, R.span({ className: 'choice-label' }, config.createElement('loading-choice', { field: this.props.field })));
        } else if (choice.value === '///empty///') {
          choiceElement = R.a({ href: 'JavaScript' + ':', onClick: this.onClose }, R.span({ className: 'choice-label' }, 'No choices available.'));
        } else if (choice.action) {
          var labelClasses = 'choice-label ' + choice.action;

          choiceElement = R.a({ href: 'JavaScript' + ':', onClick: this.onChoiceAction.bind(this, choice) }, R.span({ className: labelClasses }, choice.label || this.props.config.actionChoiceLabel(choice.action)), this.props.config.createElement('choice-action-sample', { action: choice.action, choice: choice }));
        } else if (choice.sectionKey) {
          choiceElement = R.a({ href: 'JavaScript' + ':', onClick: this.onHeaderClick.bind(this, choice) }, config.createElement('choice-section-header', { choice: choice }));
        } else {
          choiceElement = R.a({ href: 'JavaScript' + ':', onClick: this.onSelect.bind(this, choice) }, R.span({ className: 'choice-label' }, choice.label), R.span({ className: 'choice-sample' }, choice.sample));
        }

        return R.li({ key: i, className: 'choice' }, choiceElement);
      }).bind(this)))));
    }

    // not open
    return null;
  }
});

// console.log('stop that!')
// event.preventDefault();
// event.stopPropagation();

// event.preventDefault();
// event.stopPropagation();