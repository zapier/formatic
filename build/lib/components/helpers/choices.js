// # Choices component

/*
Render customized (non-native) dropdown choices.
*/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keyCodeToDirection;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactScrollLock = require('react-scroll-lock');

var _reactScrollLock2 = _interopRequireDefault(_reactScrollLock);

var _undash = require('../../undash');

var _undash2 = _interopRequireDefault(_undash);

var _utils = require('../../utils');

var _helper = require('../../mixins/helper');

var _helper2 = _interopRequireDefault(_helper);

var _clickOutside = require('../../mixins/click-outside');

var _clickOutside2 = _interopRequireDefault(_clickOutside);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var magicChoiceRe = /^\/\/\/[^/]+\/\/\/$/;

var keyCodeToDirection = (_keyCodeToDirection = {}, _defineProperty(_keyCodeToDirection, _utils.keyCodes.UP, -1), _defineProperty(_keyCodeToDirection, _utils.keyCodes.DOWN, 1), _keyCodeToDirection);

var requestAnimationFrameThrottled = function requestAnimationFrameThrottled() {
  var frameCount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  var cb = arguments[1];

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

var getInitiallyOpenSections = function getInitiallyOpenSections() {
  var choices = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return choices.filter(function (choice) {
    return choice.sectionKey && choice.initialState === 'open';
  }).map(function (choice) {
    return choice.sectionKey;
  });
};

exports.default = (0, _createReactClass2.default)({

  displayName: 'Choices',

  mixins: [_helper2.default, _clickOutside2.default, _reactScrollLock2.default],

  // return new set of open sections, when user clicks on section header with sectionKey
  getNextOpenSections: function getNextOpenSections(sectionKey) {
    var canOpenMultipleSections = this.props.canOpenMultipleSections;
    var openSections = this.state.openSections;


    if (openSections.indexOf(sectionKey) === -1) {
      // currently closed, so open it:
      if (canOpenMultipleSections) {
        // open this section, leave others alone:
        return openSections.concat([sectionKey]);
      } else {
        // open this section, close all others:
        return [sectionKey];
      }
    } else {
      // currently open, so close it (ie remove it from the list of open sections):
      return openSections.filter(function (key) {
        return sectionKey !== key;
      });
    }
  },


  getInitialState: function getInitialState() {
    return {
      maxHeight: null,
      open: this.props.open,
      searchString: '',
      hoverValue: null,
      openSections: getInitiallyOpenSections(this.props.choices)
    };
  },

  getIgnoreCloseNodes: function getIgnoreCloseNodes() {
    if (!this.props.ignoreCloseNodes) {
      return [];
    }
    var nodes = this.props.ignoreCloseNodes();
    if (!_undash2.default.isArray(nodes)) {
      nodes = [nodes];
    }
    return nodes;
  },

  componentDidMount: function componentDidMount() {
    this.setOnClickOutside('container', function (event) {

      // Make sure we don't find any nodes to ignore.
      if (!_undash2.default.find(this.getIgnoreCloseNodes(), function (node) {
        return this.isNodeInside(event.target, node);
      }.bind(this))) {
        this.onClose();
      }
    }.bind(this));

    if (this.searchRef) {
      this.searchRef.focus();
    }

    this.adjustSize();
    this.updateListeningToWindow();
  },

  componentWillUnmount: function componentWillUnmount() {
    this.stopListeningToWindow();
  },

  onSelect: function onSelect(choice, event) {
    this.setState({
      openSections: getInitiallyOpenSections(this.props.choices),
      searchString: ''
    });
    this.props.onSelect(choice.value, event);
  },

  onChoiceAction: function onChoiceAction(choice) {
    this.setState({
      openSections: getInitiallyOpenSections(this.props.choices),
      searchString: choice.keepSearchString ? this.state.searchString : ''
    });
    this.props.onChoiceAction(choice);
  },

  onClose: function onClose() {
    this.setState({
      openSections: getInitiallyOpenSections(this.props.choices),
      searchString: ''
    });
    this.props.onClose();
  },

  // Doing something a little crazy... measuring on every frame. Makes this smoother than using an interval.
  // Can't using scrolling events, because we might be scrolling inside a container instead of the body.
  // Shouldn't be any more costly than animations though, I think. And only one of these is open at a time.
  updateListeningToWindow: function updateListeningToWindow() {
    var _this = this;

    if (this.choicesRef) {
      if (!this.isListening) {
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
        this.isListening = true;
        listenToFrame();
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
    if (this.choicesRef) {
      var node = this.containerRef;
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
      open: nextProps.open,
      openSections: getInitiallyOpenSections(nextProps.choices)
    };

    // For now, erase hover value when opening. Maybe get smarter about this later.
    if (isOpening) {
      nextState.hoverValue = null;
    }

    var isSearchOpening = this.isSearchOpening(nextProps);

    this.setState(nextState, function () {
      if (isOpening || isSearchOpening) {
        if (_this2.searchRef) {
          _this2.searchRef.focus();
        }
      }
      _this2.adjustSize();
      _this2.updateListeningToWindow();
    });
  },

  onHeaderClick: function onHeaderClick(choice) {
    this.setState({
      openSections: this.getNextOpenSections(choice.sectionKey)
    }, this.adjustSize);
  },

  hasOneSection: function hasOneSection() {
    var sectionHeaders = this.props.choices.filter(function (c) {
      return c.sectionKey;
    });
    return sectionHeaders.length < 2;
  },

  visibleChoices: function visibleChoices() {
    return this.visibleChoicesInfo.apply(this, arguments).choices;
  },
  visibleChoicesInfo: function visibleChoicesInfo() {
    var _this3 = this;

    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;


    var choices = props.choices;
    var config = props.config;

    if (choices && choices.length === 0) {
      return {
        choices: [{ value: '///empty///' }],
        hasDisabledSections: true
      };
    }

    if (this.state.searchString) {
      choices = choices.filter(function (choice) {
        if (choice.sectionKey) {
          return true;
        }
        return config.isSearchStringInChoice(_this3.state.searchString, choice);
      });
    }

    choices = config.sortChoices(choices, this.state.searchString);

    if (!props.isAccordion) {
      return {
        choices: choices,
        hasDisabledSections: true
      };
    }

    var openSections = this.state.openSections;
    var alwaysExanded = !props.isAccordionAlwaysCollapsable && this.hasOneSection() || this.state.searchString;
    var visibleChoices = [];
    var isInOpenSection;
    var isInSection = false;

    choices.forEach(function (choice) {
      if (choice.sectionKey) {
        isInSection = true;
        isInOpenSection = openSections.indexOf(choice.sectionKey) !== -1;
      } else if (_undash2.default.isNull(choice.sectionKey)) {
        isInSection = false;
      }
      if (choice.value && String(choice.value).match(magicChoiceRe)) {
        visibleChoices.push(choice);
      } else if (alwaysExanded || choice.sectionKey || isInOpenSection || !isInSection) {
        visibleChoices.push(choice);
      }
    });

    return {
      choices: visibleChoices,
      hasDisabledSections: alwaysExanded
    };
  },
  hasSearch: function hasSearch() {
    var visibleChoices = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.visibleChoices();
    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.props;

    if (!props.config.fieldHasSearch(props.field)) {
      return false;
    }

    var hasSearch = !!this.state.searchString;

    if (!hasSearch) {
      if (props.choices.length > 2) {
        if (_undash2.default.find(visibleChoices, function (choice) {
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

    if (direction !== 0 || event.keyCode === _utils.keyCodes.ENTER) {

      var visibleChoices = this.visibleChoices();
      var hoverValue = this.state.hoverValue;


      event.preventDefault();
      event.stopPropagation();

      if (direction !== 0) {
        if (visibleChoices) {
          var hoverIndex = -1;
          if (hoverValue === 'search') {
            hoverIndex = -1;
          } else {
            _undash2.default.find(visibleChoices, function (choice, i) {
              if (hoverValue === _this4.choiceValue(choice)) {
                hoverIndex = i;
                return true;
              }

              return false;
            });
          }
          var nextHoverIndex = hoverIndex + direction;
          if (nextHoverIndex < 0) {
            nextHoverIndex = 0;
            if (this.containerRef) {
              var containerNode = _reactDom2.default.findDOMNode(this.containerRef);
              containerNode.scrollTop = 0;
            }
          } else if (nextHoverIndex + 1 > visibleChoices.length) {
            nextHoverIndex = visibleChoices.length - 1;
          }
          var nextHoverComponent = this['choice-' + nextHoverIndex + 'Ref'];
          if (nextHoverComponent && this.containerRef) {
            var node = _reactDom2.default.findDOMNode(nextHoverComponent);
            var _containerNode = _reactDom2.default.findDOMNode(this.containerRef);
            (0, _utils.scrollIntoContainerView)(node, _containerNode);
          }
          var nextHoverValue = nextHoverIndex > -1 ? this.choiceValue(visibleChoices[nextHoverIndex]) : 'search';
          if (nextHoverValue === 'search') {
            if (this.searchRef) {
              this.searchRef.focus();
            }
          }
          this.setState({
            hoverValue: nextHoverValue
          });
        }
      }

      if (event.keyCode === _utils.keyCodes.ENTER) {
        var selectedChoice = _undash2.default.find(visibleChoices, function (choice) {
          return _this4.choiceValue(choice) === hoverValue;
        });
        if (selectedChoice) {
          if (this.props.onFocusSelect) {
            this.props.onFocusSelect();
          }
          if (hoverValue.indexOf('value:') === 0) {
            this.onSelect(selectedChoice, event);
          } else if (selectedChoice.action) {
            this.onChoiceAction(selectedChoice);
          } else if (selectedChoice.sectionKey) {
            this.onHeaderClick(selectedChoice);
          } else {
            this.onClose();
          }
        }
      }
    }
  },


  renderDefault: function renderDefault() {

    if (!this.props.open) {
      return null;
    }

    var config = this.props.config;

    var _visibleChoicesInfo = this.visibleChoicesInfo(),
        choices = _visibleChoicesInfo.choices,
        hasDisabledSections = _visibleChoicesInfo.hasDisabledSections;

    var search = null;

    var hasSearch = this.hasSearch(choices);

    if (hasSearch) {
      search = config.createElement('choices-search', {
        ref: (0, _utils.ref)(this, 'search'),
        key: 'choices-search',
        field: this.props.field,
        onChange: this.onChangeSearch
      });
    }

    return _react2.default.createElement(
      'div',
      {
        ref: (0, _utils.ref)(this, 'container'),
        onClick: this.onClick,
        className: 'choices-container',
        style: {
          userSelect: 'none',
          WebkitUserSelect: 'none',
          position: 'absolute',
          maxHeight: this.state.maxHeight ? this.state.maxHeight : null
        } },
      config.cssTransitionWrapper(search, _react2.default.createElement(
        'ul',
        {
          key: 'choices',
          ref: (0, _utils.ref)(this, 'choices'),
          className: 'choices' },
        choices.map(function (choice, i) {

          var choiceElement = null;
          var choiceValue = null;

          if (choice.value === '///loading///') {
            choiceElement = _react2.default.createElement(
              'a',
              { href: 'JavaScript' + ':', onClick: this.onClose },
              _react2.default.createElement(
                'span',
                { className: 'choice-label' },
                config.createElement('loading-choice', { field: this.props.field })
              )
            );

            choiceValue = 'loading';
          } else if (choice.value === '///empty///') {
            choiceElement = _react2.default.createElement(
              'a',
              { href: 'JavaScript' + ':', onClick: this.onClose },
              _react2.default.createElement(
                'span',
                { className: 'choice-label' },
                'No choices available.'
              )
            );

            choiceValue = 'empty';
          } else if (choice.action) {
            var labelClasses = 'choice-label ' + choice.action;
            var anchorClasses = 'action-choice ' + choice.action;

            choiceElement = _react2.default.createElement(
              'a',
              { href: 'JavaScript' + ':', onClick: this.onChoiceAction.bind(this, choice), className: anchorClasses },
              _react2.default.createElement(
                'span',
                { className: labelClasses },
                choice.label || this.props.config.actionChoiceLabel(choice.action)
              ),
              this.props.config.createElement('choice-action-sample', {
                action: choice.action,
                choice: choice
              })
            );

            choiceValue = 'action:' + choice.action;
          } else if (choice.sectionKey) {
            choiceElement = _react2.default.createElement(
              'a',
              { href: 'JavaScript' + ':', onClick: this.onHeaderClick.bind(this, choice) },
              config.createElement('choice-section-header', {
                choice: choice,
                isOpen: this.state.openSections.indexOf(choice.sectionKey) !== -1,
                isDisabled: hasDisabledSections
              })
            );

            choiceValue = 'section:' + choice.sectionKey;
          } else {
            choiceElement = config.createElement('choice', {
              onSelect: this.onSelect,
              choice: choice,
              field: this.props.field,
              index: i,
              total: choices.length
            });

            choiceValue = 'value:' + choice.value;
          }

          return config.createElement('choices-item', {
            ref: (0, _utils.ref)(this, 'choice-' + i),
            key: i,
            isHovering: this.state.hoverValue && this.state.hoverValue === choiceValue
          }, choiceElement);
        }.bind(this))
      ))
    );
  }
});