// # Choices component

/*
Render customized (non-native) dropdown choices.
*/

'use strict';

import createReactClass from 'create-react-class';
import ReactDOM from 'react-dom';
import ScrollLock from 'react-scroll-lock';

import _ from '@/src/undash';
import { keyCodes, ref, scrollIntoContainerView } from '@/src/utils';
import HelperMixin from '@/src/mixins/helper';
import ClickOutsideMixin from '@/src/mixins/click-outside';

/** @jsx jsx */
import jsx from '@/src/jsx';

const magicChoiceRe = /^\/\/\/[^/]+\/\/\/$/;

const keyCodeToDirection = {
  [keyCodes.UP]: -1,
  [keyCodes.DOWN]: 1,
};

const requestAnimationFrameThrottled = (frameCount = 1, cb) => {
  if (frameCount < 1) {
    frameCount = 1;
  }
  let frameIndex = 0;
  const listenToFrame = () => {
    requestAnimationFrame((...args) => {
      frameIndex++;
      if (frameIndex === frameCount) {
        cb(...args);
      } else {
        listenToFrame();
      }
    });
  };
  listenToFrame();
};

const getInitiallyOpenSections = (choices = []) =>
  choices
    .filter(choice => choice.sectionKey && choice.initialState === 'open')
    .map(choice => choice.sectionKey);

const choiceTypes = [
  {
    test: choice => choice.value === '///loading///',
    name: 'info-choice',
    value: () => 'loading',
    props: component => ({
      onSelect: component.onClose,
      label: component.props.config.createElement('loading-choice', {
        typeName: component.props.typeName,
        field: component.props.field,
      }),
    }),
  },
  {
    test: choice => choice.value === '///empty///',
    name: 'info-choice',
    value: () => 'empty',
    props: component => ({
      onSelect: component.onClose,
      label: 'No choices available.',
    }),
  },
  {
    test: choice => choice.action,
    name: 'action-choice',
    value: choice => `action:${choice.action}`,
    props: (component, choice) => ({
      onSelect: component.onChoiceAction,
      label:
        choice.label || component.props.config.actionChoiceLabel(choice.action),
    }),
  },
  {
    test: choice => choice.sectionKey,
    name: 'section-choice',
    value: choice => `section:${choice.sectionKey}`,
    props: (component, choice, info) => ({
      onSelect: () => component.onHeaderClick(choice),
      isOpen: component.state.openSections.indexOf(choice.sectionKey) !== -1,
      isDisabled: info.hasDisabledSections,
    }),
  },
  {
    test: () => true,
    name: 'choice',
    value: choice => `value:${choice.value}`,
  },
];

const findChoiceType = choice => {
  for (let i = 0; i < choiceTypes.length; i++) {
    const type = choiceTypes[i];
    if (type.test(choice)) {
      return type;
    }
  }
  // Should never reach this.
  return choiceTypes[choiceTypes.length - 1];
};

export default createReactClass({
  displayName: 'Choices',

  mixins: [HelperMixin, ClickOutsideMixin, ScrollLock],

  // return new set of open sections, when user clicks on section header with sectionKey
  getNextOpenSections(sectionKey) {
    const { canOpenMultipleSections } = this.props;
    const { openSections } = this.state;

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
      return openSections.filter(key => sectionKey !== key);
    }
  },

  getInitialState: function() {
    return {
      maxHeight: null,
      open: this.props.open,
      searchString: '',
      hoverValue: null,
      openSections: getInitiallyOpenSections(this.props.choices),
    };
  },

  getIgnoreCloseNodes: function() {
    if (!this.props.ignoreCloseNodes) {
      return [];
    }
    let nodes = this.props.ignoreCloseNodes();
    if (!_.isArray(nodes)) {
      nodes = [nodes];
    }
    return nodes;
  },

  componentDidMount: function() {
    this.setOnClickOutside(
      'container',
      function(event) {
        // Make sure we don't find any nodes to ignore.
        if (
          !_.find(
            this.getIgnoreCloseNodes(),
            function(node) {
              return this.isNodeInside(event.target, node);
            }.bind(this)
          )
        ) {
          this.onClose();
        }
      }.bind(this)
    );

    if (this.searchRef) {
      this.searchRef.focus();
    }

    this.adjustSize();
    this.updateListeningToWindow();
  },

  componentWillUnmount: function() {
    this.stopListeningToWindow();
  },

  onSelect: function(choice, event) {
    this.setState({
      openSections: getInitiallyOpenSections(this.props.choices),
      searchString: '',
    });
    this.props.onSelect(choice.value, event);
  },

  onChoiceAction: function(choice) {
    this.setState({
      openSections: getInitiallyOpenSections(this.props.choices),
      searchString: choice.keepSearchString ? this.state.searchString : '',
    });
    this.props.onChoiceAction(choice);
  },

  onClose: function() {
    this.setState({
      openSections: getInitiallyOpenSections(this.props.choices),
      searchString: '',
    });
    this.props.onClose();
  },

  // Doing something a little crazy... measuring on every frame. Makes this smoother than using an interval.
  // Can't using scrolling events, because we might be scrolling inside a container instead of the body.
  // Shouldn't be any more costly than animations though, I think. And only one of these is open at a time.
  updateListeningToWindow: function() {
    if (this.choicesRef) {
      if (!this.isListening) {
        const listenToFrame = () => {
          requestAnimationFrameThrottled(3, () => {
            if (this.isListening) {
              // Make sure we don't adjust again before rendering.
              this.adjustSize(() => {
                if (this.isListening) {
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

  stopListeningToWindow: function() {
    if (this.isListening) {
      this.isListening = false;
    }
  },

  adjustSize: function(cb) {
    let didSetState = false;
    if (this.choicesRef) {
      const node = this.containerRef;
      const rect = node.getBoundingClientRect();
      const top = rect.top;
      const windowHeight = window.innerHeight;
      const maxHeightRatio = this.props.config.getChoicesMaxHeightRatio();
      const clampedRatio = Math.min(Math.abs(maxHeightRatio), 1);
      const actualHeight = windowHeight - top;
      const desiredMaxHeight = actualHeight * clampedRatio;
      if (Math.round(desiredMaxHeight) !== Math.round(this.state.maxHeight)) {
        didSetState = true;
        this.setState(
          {
            maxHeight: desiredMaxHeight,
          },
          cb
        );
      }
    }
    if (!didSetState) {
      if (cb) {
        cb();
      }
    }
  },

  componentWillReceiveProps: function(nextProps) {
    const isOpening = !this.props.open && nextProps.open;

    const nextState = {
      open: nextProps.open,
      openSections: getInitiallyOpenSections(nextProps.choices),
    };

    // For now, erase hover value when opening. Maybe get smarter about this later.
    if (isOpening) {
      nextState.hoverValue = null;
    }

    const isSearchOpening = this.isSearchOpening(nextProps);

    this.setState(nextState, () => {
      if (isOpening || isSearchOpening) {
        if (this.searchRef) {
          this.searchRef.focus();
        }
      }
      this.adjustSize();
      this.updateListeningToWindow();
    });
  },

  onHeaderClick: function(choice) {
    this.setState(
      {
        openSections: this.getNextOpenSections(choice.sectionKey),
      },
      this.adjustSize
    );
  },

  hasOneSection: function() {
    const sectionHeaders = this.props.choices.filter(function(c) {
      return c.sectionKey;
    });
    return sectionHeaders.length < 2;
  },

  visibleChoices(...args) {
    return this.visibleChoicesInfo(...args).choices;
  },

  visibleChoicesInfo(props = this.props) {
    let choices = props.choices;
    const config = props.config;

    if (choices && choices.length === 0) {
      return {
        choices: [{ value: '///empty///' }],
        hasDisabledSections: true,
      };
    }

    if (this.state.searchString) {
      choices = choices.filter(choice => {
        if (choice.sectionKey) {
          return true;
        }
        return config.isSearchStringInChoice(this.state.searchString, choice);
      });
    }

    choices = config.sortChoices(choices, this.state.searchString);

    if (!props.isAccordion) {
      return {
        choices,
        hasDisabledSections: true,
      };
    }

    const openSections = this.state.openSections;
    const alwaysExanded =
      (!props.isAccordionAlwaysCollapsable && this.hasOneSection()) ||
      this.state.searchString;
    const visibleChoices = [];
    let isInOpenSection;
    let isInSection = false;

    choices.forEach(function(choice) {
      if (choice.sectionKey) {
        isInSection = true;
        isInOpenSection = openSections.indexOf(choice.sectionKey) !== -1;
      } else if (_.isNull(choice.sectionKey)) {
        isInSection = false;
      }
      if (choice.value && String(choice.value).match(magicChoiceRe)) {
        visibleChoices.push(choice);
      } else if (
        alwaysExanded ||
        choice.sectionKey ||
        isInOpenSection ||
        !isInSection
      ) {
        visibleChoices.push(choice);
      }
    });

    return {
      choices: visibleChoices,
      hasDisabledSections: alwaysExanded,
    };
  },

  hasSearch(visibleChoices = this.visibleChoices(), props = this.props) {
    if (!props.config.fieldHasSearch(props.field)) {
      return false;
    }

    let hasSearch = !!this.state.searchString;

    if (!hasSearch) {
      if (props.choices.length > 2) {
        if (
          _.find(
            visibleChoices,
            choice => !choice.action && choice.value !== '///loading///'
          )
        ) {
          hasSearch = true;
        }
      }
    }

    return hasSearch;
  },

  isSearchOpening(nextProps) {
    if (this.props.choices.length < nextProps.choices.length) {
      const prevHasSearch = this.hasSearch(this.visibleChoices());
      const nextHasSearch = this.hasSearch(
        this.visibleChoices(nextProps),
        nextProps
      );
      if (nextHasSearch && !prevHasSearch) {
        return true;
      }
    }
    return false;
  },

  render: function() {
    return this.renderWithConfig();
  },

  onClick: function(event) {
    // swallow clicks
    event.stopPropagation();
  },

  onChangeSearch: function(event) {
    this.setState({
      searchString: event.target.value,
    });
  },

  choiceValue(choice) {
    if (choice.value === '///loading///') {
      return 'loading';
    } else if (choice.value === '///empty///') {
      return 'empty';
    } else if (choice.action) {
      return `action:${choice.action}`;
    } else if (choice.sectionKey) {
      return `section:${choice.sectionKey}`;
    } else {
      return `value:${choice.value}`;
    }
  },

  // Receive keydown events from parent. Really, this component should be
  // ripped apart into a stateless component, but much refactoring to be done
  // for that.
  onKeyDown(event) {
    const direction =
      event.keyCode in keyCodeToDirection
        ? keyCodeToDirection[event.keyCode]
        : 0;

    if (direction !== 0 || event.keyCode === keyCodes.ENTER) {
      const visibleChoices = this.visibleChoices();
      const { hoverValue } = this.state;

      event.preventDefault();
      event.stopPropagation();

      if (direction !== 0) {
        if (visibleChoices) {
          let hoverIndex = -1;
          if (hoverValue === 'search') {
            hoverIndex = -1;
          } else {
            _.find(visibleChoices, (choice, i) => {
              if (hoverValue === this.choiceValue(choice)) {
                hoverIndex = i;
                return true;
              }

              return false;
            });
          }
          let nextHoverIndex = hoverIndex + direction;
          if (nextHoverIndex < 0) {
            nextHoverIndex = 0;
            if (this.containerRef) {
              const containerNode = ReactDOM.findDOMNode(this.containerRef);
              containerNode.scrollTop = 0;
            }
          } else if (nextHoverIndex + 1 > visibleChoices.length) {
            nextHoverIndex = visibleChoices.length - 1;
          }
          const nextHoverComponent = this[`choice-${nextHoverIndex}Ref`];
          if (nextHoverComponent && this.containerRef) {
            const node = ReactDOM.findDOMNode(nextHoverComponent);
            const containerNode = ReactDOM.findDOMNode(this.containerRef);
            scrollIntoContainerView(node, containerNode);
          }
          const nextHoverValue =
            nextHoverIndex > -1
              ? this.choiceValue(visibleChoices[nextHoverIndex])
              : 'search';
          if (nextHoverValue === 'search') {
            if (this.searchRef) {
              this.searchRef.focus();
            }
          }
          this.setState({
            hoverValue: nextHoverValue,
          });
        }
      }

      if (event.keyCode === keyCodes.ENTER) {
        const selectedChoice = _.find(
          visibleChoices,
          choice => this.choiceValue(choice) === hoverValue
        );
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

  renderDefault: function() {
    if (!this.props.open) {
      return null;
    }

    const config = this.props.config;

    const { choices, hasDisabledSections } = this.visibleChoicesInfo();

    const info = { hasDisabledSections };

    let search = null;

    const hasSearch = this.hasSearch(choices);

    if (hasSearch) {
      search = config.createElement('choices-search', {
        typeName: this.props.typeName,
        ref: ref(this, 'search'),
        key: 'choices-search',
        field: this.props.field,
        onChange: this.onChangeSearch,
      });
    }

    return (
      <div
        className="choices-container"
        onClick={this.onClick}
        ref={ref(this, 'container')}
        renderWith={this.renderWith('Choices')}
        role="presentation"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          position: 'absolute',
          maxHeight: this.state.maxHeight ? this.state.maxHeight : null,
        }}
      >
        {search}
        <ul
          className="choices"
          key="choices"
          ref={ref(this, 'choices')}
          renderWith={this.renderWith('ChoicesList')}
        >
          {choices.map((choice, i) => {
            const choiceType = findChoiceType(choice);
            const choiceValue = choiceType.value(choice);
            const choiceProps = {
              typeName: this.props.typeName,
              onSelect: this.onSelect,
              choice,
              field: this.props.field,
              index: i,
              total: choices.length,
            };
            if (choiceType.props) {
              _.extend(choiceProps, choiceType.props(this, choice, info));
            }
            const choiceElement = config.createElement(
              choiceType.name,
              choiceProps
            );

            return config.createElement(
              'choices-item',
              {
                typeName: this.props.typeName,
                field: this.props.field,
                ref: ref(this, `choice-${i}`),
                key: i,
                isHovering:
                  this.state.hoverValue &&
                  this.state.hoverValue === choiceValue,
              },
              choiceElement
            );
          })}
        </ul>
      </div>
    );
  },
});
