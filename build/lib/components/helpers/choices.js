// # Choices component

/*
Render customized (non-native) dropdown choices.
*/

'use strict';

var _keyCodeToDirection;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var React = require('react');
var R = React.DOM;
var ReactDOM = require('react-dom');
var _ = require('../../undash');
var ScrollLock = require('react-scroll-lock');

var _require = require('../../utils');

var keyCodes = _require.keyCodes;
var scrollIntoContainerView = _require.scrollIntoContainerView;

var magicChoiceRe = /^\/\/\/[^\/]+\/\/\/$/;

var keyCodeToDirection = (_keyCodeToDirection = {}, _defineProperty(_keyCodeToDirection, keyCodes.UP, -1), _defineProperty(_keyCodeToDirection, keyCodes.DOWN, 1), _keyCodeToDirection);

var requestAnimationFrameThrottled = function requestAnimationFrameThrottled(frameCount, cb) {
  if (frameCount === undefined) frameCount = 1;

  if (frameCount < 1) {
    frameCount = 1;
  }
  var frameIndex = 0;
  var listenToFrame = function listenToFrame() {
    requestAnimationFrame(function () {
      frameIndex++;
      if (frameIndex === frameCount) {
        cb.apply(undefined, arguments);
      } else {
        listenToFrame();
      }
    });
  };
  listenToFrame();
};

module.exports = React.createClass({

  displayName: 'Choices',

  mixins: [require('../../mixins/helper'),
  //plugin.require('mixin.resize'),
  //plugin.require('mixin.scroll'),
  require('../../mixins/click-outside'), ScrollLock],

  getInitialState: function getInitialState() {
    return {
      maxHeight: null,
      open: this.props.open,
      searchString: '',
      hoverValue: null
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

    if (this.refs.search) {
      this.refs.search.focus();
    }

    this.adjustSize();
    this.updateListeningToWindow();
  },

  componentWillUnmount: function componentWillUnmount() {
    this.stopListeningToWindow();
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

  // Doing something a little crazy... measuring on every frame. Makes this smoother than using an interval.
  // Can't using scrolling events, because we might be scrolling inside a container instead of the body.
  // Shouldn't be any more costly than animations though, I think. And only one of these is open at a time.
  updateListeningToWindow: function updateListeningToWindow() {
    var _this = this;

    if (this.refs.choices) {
      if (!this.isListening) {
        (function () {
          var listenToFrame = function listenToFrame() {
            requestAnimationFrameThrottled(3, function () {
              if (_this.isListening) {
                // Make sure we don't adjust again before rendering.
                _this.adjustSize(function () {
                  if (_this.isListening) {
                    listenToFrame();
                  }
                });
              }
            });
          };
          _this.isListening = true;
          listenToFrame();
        })();
      }
    } else {
      if (this.isListening) {
        this.stopListeningToWindow();
      }
    }
  },

  stopListeningToWindow: function stopListeningToWindow() {
    if (this.isListening) {
      this.isListening = false;
    }
  },

  adjustSize: function adjustSize(cb) {
    var didSetState = false;
    if (this.refs.choices) {
      var node = this.refs.container;
      var rect = node.getBoundingClientRect();
      var top = rect.top;
      var windowHeight = window.innerHeight;
      var height = windowHeight - top;
      if (height !== this.state.maxHeight) {
        didSetState = true;
        this.setState({
          maxHeight: height
        }, cb);
      }
    }
    if (!didSetState) {
      if (cb) {
        cb();
      }
    }
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var _this2 = this;

    var isOpening = !this.props.open && nextProps.open;

    var nextState = {
      open: nextProps.open
    };

    // For now, erase hover value when opening. Maybe get smarter about this later.
    if (isOpening) {
      nextState.hoverValue = null;
    }

    var isSearchOpening = this.isSearchOpening(nextProps);

    this.setState(nextState, function () {
      if (isOpening || isSearchOpening) {
        if (_this2.refs.search) {
          _this2.refs.search.focus();
        }
      }
      _this2.adjustSize();
      _this2.updateListeningToWindow();
    });
  },

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
    var _this3 = this;

    var props = arguments.length <= 0 || arguments[0] === undefined ? this.props : arguments[0];

    var choices = props.choices;
    var config = props.config;

    if (choices && choices.length === 0) {
      return [{ value: '///empty///' }];
    }

    if (this.state.searchString) {
      choices = choices.filter(function (choice) {
        if (choice.sectionKey) {
          return true;
        }
        return config.isSearchStringInChoice(_this3.state.searchString, choice);
      });
    }

    if (!props.isAccordion) {
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

  hasSearch: function hasSearch() {
    var visibleChoices = arguments.length <= 0 || arguments[0] === undefined ? this.visibleChoices() : arguments[0];
    var props = arguments.length <= 1 || arguments[1] === undefined ? this.props : arguments[1];

    var hasSearch = !!this.state.searchString;

    if (!hasSearch) {
      if (props.choices.length > 2) {
        if (_.find(visibleChoices, function (choice) {
          return !choice.action && choice.value !== '///loading///';
        })) {
          hasSearch = true;
        }
      }
    }

    return hasSearch;
  },

  isSearchOpening: function isSearchOpening(nextProps) {
    if (this.props.choices.length < nextProps.choices.length) {
      var prevHasSearch = this.hasSearch(this.visibleChoices());
      var nextHasSearch = this.hasSearch(this.visibleChoices(nextProps), nextProps);
      if (nextHasSearch && !prevHasSearch) {
        return true;
      }
    }
    return false;
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

  choiceValue: function choiceValue(choice) {
    if (choice.value === '///loading///') {
      return 'loading';
    } else if (choice.value === '///empty///') {
      return 'empty';
    } else if (choice.action) {
      return 'action:' + choice.action;
    } else if (choice.sectionKey) {
      return 'section:' + choice.sectionKey;
    } else {
      return 'value:' + choice.value;
    }
  },

  // Receive keydown events from parent. Really, this component should be
  // ripped apart into a stateless component, but much refactoring to be done
  // for that.
  onKeyDown: function onKeyDown(event) {
    var _this4 = this;

    var direction = event.keyCode in keyCodeToDirection ? keyCodeToDirection[event.keyCode] : 0;

    if (direction !== 0 || event.keyCode === keyCodes.ENTER) {
      (function () {

        var visibleChoices = _this4.visibleChoices();
        var hoverValue = _this4.state.hoverValue;

        event.preventDefault();
        event.stopPropagation();

        if (direction !== 0) {
          if (visibleChoices) {
            var hoverIndex = -1;
            if (hoverValue === 'search') {
              hoverIndex = -1;
            } else {
              _.find(visibleChoices, function (choice, i) {
                if (hoverValue === _this4.choiceValue(choice)) {
                  hoverIndex = i;
                  return true;
                }
              });
            }
            var nextHoverIndex = hoverIndex + direction;
            if (nextHoverIndex < 0) {
              nextHoverIndex = 0;
              if (_this4.refs.container) {
                var containerNode = ReactDOM.findDOMNode(_this4.refs.container);
                containerNode.scrollTop = 0;
              }
            } else if (nextHoverIndex + 1 > visibleChoices.length) {
              nextHoverIndex = visibleChoices.length - 1;
            }
            var nextHoverComponent = _this4.refs['choice-' + nextHoverIndex];
            if (nextHoverComponent && _this4.refs.container) {
              var node = ReactDOM.findDOMNode(nextHoverComponent);
              var containerNode = ReactDOM.findDOMNode(_this4.refs.container);
              scrollIntoContainerView(node, containerNode);
            }
            var nextHoverValue = nextHoverIndex > -1 ? _this4.choiceValue(visibleChoices[nextHoverIndex]) : 'search';
            if (nextHoverValue === 'search') {
              if (_this4.refs.search) {
                _this4.refs.search.focus();
              }
            }
            _this4.setState({
              hoverValue: nextHoverValue
            });
          }
        }

        if (event.keyCode === keyCodes.ENTER) {
          var selectedChoice = _.find(visibleChoices, function (choice) {
            return _this4.choiceValue(choice) === hoverValue;
          });
          if (selectedChoice) {
            if (hoverValue.indexOf('value:') === 0) {
              _this4.onSelect(selectedChoice, event);
            } else if (selectedChoice.action) {
              _this4.onChoiceAction(selectedChoice);
            } else if (selectedChoice.sectionKey) {
              _this4.onHeaderClick(selectedChoice);
            } else {
              _this4.onClose();
            }
          }
        }
      })();
    }
  },

  renderDefault: function renderDefault() {

    if (!this.props.open) {
      return null;
    }

    var config = this.props.config;

    var choices = this.visibleChoices();

    var search = null;

    var hasSearch = this.hasSearch(choices);

    if (hasSearch) {
      search = config.createElement('choices-search', { ref: 'search', key: 'choices-search', field: this.props.field, onChange: this.onChangeSearch });
    }

    return R.div({
      ref: 'container', onClick: this.onClick, className: 'choices-container', style: {
        userSelect: 'none', WebkitUserSelect: 'none', position: 'absolute',
        maxHeight: this.state.maxHeight ? this.state.maxHeight : null
      }
    }, config.cssTransitionWrapper(search, R.ul({ key: 'choices', ref: 'choices', className: 'choices' }, choices.map((function (choice, i) {

      var choiceElement = null;
      var choiceValue = null;

      if (choice.value === '///loading///') {
        choiceElement = R.a({ href: 'JavaScript' + ':', onClick: this.onClose }, R.span({ className: 'choice-label' }, config.createElement('loading-choice', { field: this.props.field })));
        choiceValue = 'loading';
      } else if (choice.value === '///empty///') {
        choiceElement = R.a({ href: 'JavaScript' + ':', onClick: this.onClose }, R.span({ className: 'choice-label' }, 'No choices available.'));
        choiceValue = 'empty';
      } else if (choice.action) {
        var labelClasses = 'choice-label ' + choice.action;

        choiceElement = R.a({ href: 'JavaScript' + ':', onClick: this.onChoiceAction.bind(this, choice) }, R.span({ className: labelClasses }, choice.label || this.props.config.actionChoiceLabel(choice.action)), this.props.config.createElement('choice-action-sample', { action: choice.action, choice: choice }));
        choiceValue = 'action:' + choice.action;
      } else if (choice.sectionKey) {
        choiceElement = R.a({ href: 'JavaScript' + ':', onClick: this.onHeaderClick.bind(this, choice) }, config.createElement('choice-section-header', { choice: choice }));
        choiceValue = 'section:' + choice.sectionKey;
      } else {
        choiceElement = config.createElement('choice', {
          onSelect: this.onSelect, choice: choice, field: this.props.field
        });
        choiceValue = 'value:' + choice.value;
      }

      return config.createElement('choices-item', {
        ref: 'choice-' + i, key: i, isHovering: this.state.hoverValue && this.state.hoverValue === choiceValue
      }, choiceElement);
    }).bind(this)))));
  }
});