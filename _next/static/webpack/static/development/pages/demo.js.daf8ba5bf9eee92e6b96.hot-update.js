webpackHotUpdate("static/development/pages/demo.js",{

/***/ "./demo/examples/pretty-text.js":
/*!**************************************!*\
  !*** ./demo/examples/pretty-text.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var fields = [{
  label: 'Pretty Text',
  key: 'prettyText',
  type: 'pretty-text',
  default: 'Hi there {{firstName}} {{lastName}} {{middleName}}.',
  choices: [{
    value: 'lastName',
    label: 'Last Name',
    sample: 'Smith'
  }, {
    value: 'middleName',
    label: 'A really long label that should break somewhere in the middle and then definitely fill up all the space.'
  }],
  replaceChoices: [{
    value: 'firstName',
    label: 'First Name',
    sample: 'Bob',
    tagClasses: {
      special: true
    }
  }, {
    value: 'lastName',
    label: 'Last Name',
    sample: 'Smith'
  }, {
    value: 'middleName',
    label: 'A really long label that should break somewhere in the middle and then definitely fill up all the space.'
  }]
}, {
  label: 'Pretty Text with integer default',
  key: 'integerPrettyText',
  type: 'pretty-text',
  default: 1,
  placeholder: 1
}, {
  label: 'Group',
  type: 'fields',
  fields: [{
    label: 'Pretty Text with integer default',
    key: 'integerPrettyTextGrouped',
    type: 'pretty-text',
    default: 1,
    placeholder: 1
  }]
}, {
  label: 'Readonly pretty text',
  key: 'readonlyPrettyText',
  type: 'pretty-text',
  default: "Nah nah you can't edit me",
  readOnly: true
}, {
  label: 'Accordion Names',
  key: 'nestedPrettyText',
  type: 'pretty-text',
  isAccordion: true,
  default: 'Hi there {{firstName}} {{lastName}} {{middleName}}.',
  isLoading: true,
  replaceChoices: [{
    label: 'Name',
    value: 'name'
  }, {
    label: 'Hi Class People',
    sectionKey: 'hiClass'
  }, {
    value: 'givenName',
    label: 'Given Name',
    sample: 'Sir Duke',
    tagClasses: {
      special: true
    }
  }, {
    value: 'surname',
    label: 'Surname',
    sample: 'Ellington'
  }, {
    label: 'Lo Class People',
    sectionKey: 'loClass'
  }, {
    value: 'firstName',
    label: 'First Name',
    sample: 'Peasant'
  }, {
    value: 'lastName',
    label: 'Last Name',
    sample: 'Brown'
  }, {
    sectionKey: null,
    value: 'extraName',
    label: 'Extra Name',
    sample: 'Extra'
  }]
}];
/* harmony default export */ __webpack_exports__["default"] = ({
  title: 'Pretty Text',
  aliases: ['pretty-text', 'pretty-textarea'],
  notes: null,
  fields: fields
});

/***/ }),

/***/ "./pages/demo.js":
/*!***********************!*\
  !*** ./pages/demo.js ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_corejs2_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime-corejs2/helpers/esm/extends */ "./node_modules/@babel/runtime-corejs2/helpers/esm/extends.js");
/* harmony import */ var _babel_runtime_corejs2_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime-corejs2/helpers/esm/classCallCheck */ "./node_modules/@babel/runtime-corejs2/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_corejs2_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime-corejs2/helpers/esm/createClass */ "./node_modules/@babel/runtime-corejs2/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_corejs2_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime-corejs2/helpers/esm/possibleConstructorReturn */ "./node_modules/@babel/runtime-corejs2/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_corejs2_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime-corejs2/helpers/esm/getPrototypeOf */ "./node_modules/@babel/runtime-corejs2/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_corejs2_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime-corejs2/helpers/esm/inherits */ "./node_modules/@babel/runtime-corejs2/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_corejs2_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @babel/runtime-corejs2/helpers/esm/toConsumableArray */ "./node_modules/@babel/runtime-corejs2/helpers/esm/toConsumableArray.js");
/* harmony import */ var _babel_runtime_corejs2_core_js_json_stringify__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @babel/runtime-corejs2/core-js/json/stringify */ "./node_modules/@babel/runtime-corejs2/core-js/json/stringify.js");
/* harmony import */ var _babel_runtime_corejs2_core_js_json_stringify__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_corejs2_core_js_json_stringify__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _babel_runtime_corejs2_core_js_object_keys__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @babel/runtime-corejs2/core-js/object/keys */ "./node_modules/@babel/runtime-corejs2/core-js/object/keys.js");
/* harmony import */ var _babel_runtime_corejs2_core_js_object_keys__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_corejs2_core_js_object_keys__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var _src_formatic__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @/src/formatic */ "./src/formatic.js");
/* harmony import */ var _docs_components_Page__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @/docs/components/Page */ "./docs/components/Page.js");
/* harmony import */ var _docs_components_Sections__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @/docs/components/Sections */ "./docs/components/Sections.js");
/* harmony import */ var _docs_components_Section__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @/docs/components/Section */ "./docs/components/Section.js");
/* harmony import */ var _docs_components_Button__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @/docs/components/Button */ "./docs/components/Button.js");
/* harmony import */ var _demo_examples__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @/demo/examples */ "./demo/examples/index.js");
/* harmony import */ var _demo_examples_custom_plugin__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @/demo/examples/custom-plugin */ "./demo/examples/custom-plugin.js");
/* harmony import */ var _src_plugins_css_plugin__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @/src/plugins/css-plugin */ "./src/plugins/css-plugin.js");



















var Form = react__WEBPACK_IMPORTED_MODULE_9___default.a.createFactory(_src_formatic__WEBPACK_IMPORTED_MODULE_11__["default"]); // Draws a hint box around each component.

var HintBox = function HintBox(props) {
  return react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement("div", {
    style: {
      padding: '1px',
      margin: '1px',
      border: '1px solid black',
      display: 'inline-block'
    }
  }, react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement("span", {
    style: {
      fontStyle: 'italic',
      fontSize: '12px'
    }
  }, props.name), props.children);
}; // Inject a HintBox into each createElement_ hook to show hints
// for plugin methods.


var hintPlugin = function hintPlugin(config) {
  var prevConfig = lodash__WEBPACK_IMPORTED_MODULE_10___default.a.extend({}, config);

  return _babel_runtime_corejs2_core_js_object_keys__WEBPACK_IMPORTED_MODULE_8___default()(config).reduce(function (newConfig, key) {
    if (key.startsWith('createElement_')) {
      newConfig[key] = function (props) {
        return react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement(HintBox, {
          key: props.key,
          name: key
        }, prevConfig[key](props));
      };
    }

    return newConfig;
  }, {
    renderTag: function renderTag(tag, tagProps, metaProps) {
      for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        children[_key - 3] = arguments[_key];
      }

      return react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement(HintBox, {
        name: "renderTag:(".concat(tag, ":").concat(metaProps.typeName, ":").concat(metaProps.elementName, ")")
      }, prevConfig.renderTag.apply(prevConfig, [tag, tagProps, metaProps].concat(children)));
    }
  });
};

var config = _src_formatic__WEBPACK_IMPORTED_MODULE_11__["default"].createConfig(_src_plugins_css_plugin__WEBPACK_IMPORTED_MODULE_18__["default"], _src_formatic__WEBPACK_IMPORTED_MODULE_11__["default"].plugins.reference, _src_formatic__WEBPACK_IMPORTED_MODULE_11__["default"].plugins.meta, _demo_examples_custom_plugin__WEBPACK_IMPORTED_MODULE_17__["default"]);
var hintConfig = _src_formatic__WEBPACK_IMPORTED_MODULE_11__["default"].createConfig(_src_plugins_css_plugin__WEBPACK_IMPORTED_MODULE_18__["default"], _src_formatic__WEBPACK_IMPORTED_MODULE_11__["default"].plugins.reference, _src_formatic__WEBPACK_IMPORTED_MODULE_11__["default"].plugins.meta, _demo_examples_custom_plugin__WEBPACK_IMPORTED_MODULE_17__["default"], hintPlugin);

var convertTitleToId = function convertTitleToId(title) {
  return title.toLowerCase().replace(/ /g, '-');
};

var DisplayFormValue = function DisplayFormValue(props) {
  return react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement("div", null, react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement("h5", null, props.title, " Form State:"), react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement("pre", null, _babel_runtime_corejs2_core_js_json_stringify__WEBPACK_IMPORTED_MODULE_7___default()(props.value, null, 2)));
};

var generateAliases = function generateAliases(aliases) {
  return aliases.map(function (alias, idx) {
    return react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement("span", {
      className: "code",
      key: idx
    }, alias);
  }).reduce(function (acc, elem) {
    return acc === null ? [elem] : [].concat(Object(_babel_runtime_corejs2_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_6__["default"])(acc), [', ', elem]);
  }, null);
};

var FormDemo =
/*#__PURE__*/
function (_Component) {
  Object(_babel_runtime_corejs2_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_5__["default"])(FormDemo, _Component);

  function FormDemo(props) {
    var _this;

    Object(_babel_runtime_corejs2_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_1__["default"])(this, FormDemo);

    _this = Object(_babel_runtime_corejs2_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__["default"])(this, Object(_babel_runtime_corejs2_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(FormDemo).call(this));
    _this.state = {
      formState: config.createRootValue(props),
      fields: props.fields,
      hints: {}
    };
    return _this;
  }

  Object(_babel_runtime_corejs2_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_2__["default"])(FormDemo, [{
    key: "onChange",
    value: function onChange(newValue, info) {
      console.info('onChange:', newValue);
      console.info('Field Info:', info);
      this.setState({
        formState: newValue
      });
    }
  }, {
    key: "onChangeFields",
    value: function onChangeFields(newValue) {
      this.setState({
        fields: newValue.source
      });
    }
  }, {
    key: "onChangeHint",
    value: function onChangeHint(id) {
      var hints = lodash__WEBPACK_IMPORTED_MODULE_10___default.a.extend({}, this.state.hints);

      hints[id] = !hints[id];
      this.setState({
        hints: hints
      });
    }
  }, {
    key: "onEvent",
    value: function onEvent(eventName, event) {
      console.info(eventName, event.path, event.field);
    }
  }, {
    key: "onCustomEvent",
    value: function onCustomEvent(eventName, info) {
      console.info(eventName, info);
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$props = this.props,
          title = _this$props.title,
          notes = _this$props.notes,
          aliases = _this$props.aliases;
      var aliasContent = !aliases ? null : react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement("p", null, "Aliases: ", generateAliases(aliases));
      var typeName = convertTitleToId(title);
      var typeContent = typeName === 'unknown-field' ? null : react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement("p", null, "Type: ", react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement("span", {
        className: "code"
      }, convertTitleToId(title)));
      var id = convertTitleToId(title);
      return react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement("div", {
        id: id
      }, react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement("div", {
        className: "row"
      }, react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement("div", {
        className: "col-sm-12"
      }, react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement("hr", null), typeContent, aliasContent, react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement("p", null, react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement(_docs_components_Button__WEBPACK_IMPORTED_MODULE_15__["default"], {
        onClick: function onClick() {
          return _this2.onChangeHint(id);
        }
      }, "Toggle Plugin Hints")), react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement("p", null, notes))), react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement("div", {
        className: "row"
      }, react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement("div", {
        className: "col-sm-8"
      }, react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement("div", {
        className: "form-example"
      }, react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement(Form, {
        config: this.state.hints[id] ? hintConfig : config,
        fields: this.state.fields,
        onBlur: function onBlur(e) {
          return _this2.onEvent('onBlur', e);
        },
        onChange: this.onChange.bind(this),
        onClearCurrentChoice: function onClearCurrentChoice(info) {
          return _this2.onCustomEvent('onClearCurrentChoice', info);
        },
        onCloseReplacements: function onCloseReplacements(info) {
          return _this2.onCustomEvent('onCloseReplacements', info);
        },
        onFocus: function onFocus(e) {
          return _this2.onEvent('onFocus', e);
        },
        onOpenReplacements: function onOpenReplacements(info) {
          return _this2.onCustomEvent('onOpenReplacements', info);
        },
        onOrderGroceries: function onOrderGroceries(info) {
          return _this2.onCustomEvent('onOrderGroceries', info);
        },
        readOnly: false,
        value: this.state.formState
      }))), react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement("div", {
        className: "col-sm-4"
      }, react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement(DisplayFormValue, {
        title: title,
        value: this.state.formState
      }))), react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement("div", {
        className: "row"
      }, react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement("div", {
        className: "col-sm-12"
      }, react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement(Form, {
        config: config,
        fields: {
          type: 'fieldset',
          collapsed: true,
          label: 'Example JSON',
          fields: [{
            key: 'source',
            type: 'json',
            default: this.state.fields
          }]
        },
        onChange: this.onChangeFields.bind(this)
      }))));
    }
  }]);

  return FormDemo;
}(react__WEBPACK_IMPORTED_MODULE_9__["Component"]);

var sortedExamples = lodash__WEBPACK_IMPORTED_MODULE_10___default.a.sortBy(_demo_examples__WEBPACK_IMPORTED_MODULE_16__["default"], ['title']);

var DemoPage = function DemoPage() {
  return react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement(_docs_components_Page__WEBPACK_IMPORTED_MODULE_12__["default"], {
    pageKey: "demo"
  }, react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement(_docs_components_Sections__WEBPACK_IMPORTED_MODULE_13__["default"], null, sortedExamples.map(function (form, idx) {
    return react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement(_docs_components_Section__WEBPACK_IMPORTED_MODULE_14__["default"], {
      key: form.title,
      title: form.title
    }, react__WEBPACK_IMPORTED_MODULE_9___default.a.createElement(FormDemo, Object(_babel_runtime_corejs2_helpers_esm_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({
      key: idx
    }, form)));
  })));
};

/* harmony default export */ __webpack_exports__["default"] = (DemoPage);

/***/ }),

/***/ "./src/components/helpers/pretty-text-input.js":
/*!*****************************************************!*\
  !*** ./src/components/helpers/pretty-text-input.js ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! create-react-class */ "./node_modules/create-react-class/index.js");
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-dom */ "./node_modules/react-dom/index.js");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _tag_translator__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./tag-translator */ "./src/components/helpers/tag-translator.js");
/* harmony import */ var _src_undash__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/src/undash */ "./src/undash.js");
/* harmony import */ var _src_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/src/utils */ "./src/utils.js");
/* harmony import */ var _src_mixins_helper__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/src/mixins/helper */ "./src/mixins/helper.js");
/* harmony import */ var _src_jsx__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @/src/jsx */ "./src/jsx.js");

/*eslint no-script-url:0 */









/** @jsx jsx */



var toString = function toString(value) {
  if (_src_undash__WEBPACK_IMPORTED_MODULE_5__["default"].isUndefined(value) || _src_undash__WEBPACK_IMPORTED_MODULE_5__["default"].isNull(value)) {
    return '';
  }

  return String(value);
};
/*
   Editor for tagged text. Renders text like "hello {{firstName}}"
   with replacement labels rendered in a pill box. Designed to load
   quickly when many separate instances of it are on the same
   page.

   Uses CodeMirror to edit text. To save memory the CodeMirror node is
   instantiated when the user moves the mouse into the edit area.
   Initially a read-only view using a simple div is shown.
 */


/* harmony default export */ __webpack_exports__["default"] = (create_react_class__WEBPACK_IMPORTED_MODULE_1___default()({
  displayName: 'PrettyTextInput',
  mixins: [_src_mixins_helper__WEBPACK_IMPORTED_MODULE_7__["default"]],
  componentDidMount: function componentDidMount() {
    this.createEditor();
  },
  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    var hasReplaceChoicesChanged = !_src_undash__WEBPACK_IMPORTED_MODULE_5__["default"].isEqual(prevProps.replaceChoices, this.props.replaceChoices);
    var hasCodeMirrorModeChanged = prevState.codeMirrorMode !== this.state.codeMirrorMode;

    if (hasCodeMirrorModeChanged || hasReplaceChoicesChanged) {
      // Changed from code mirror mode to read only mode or vice versa,
      // so setup the other editor.
      this.createEditor();
    }

    this.updateEditor();
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this.state.codeMirrorMode) {
      this.removeCodeMirrorEditor();
    }
  },
  getInitialState: function getInitialState() {
    var selectedChoices = this.props.selectedChoices;
    var replaceChoices = this.props.replaceChoices;
    var translator = Object(_tag_translator__WEBPACK_IMPORTED_MODULE_4__["default"])(selectedChoices.concat(replaceChoices), this.props.config.humanize);
    return {
      // With number values, onFocus never fires, which means it stays read-only. So convert to string.
      value: toString(this.props.value),
      codeMirrorMode: false,
      isChoicesOpen: false,
      replaceChoices: replaceChoices,
      translator: translator,
      hasChanged: false
    };
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    // If we're debouncing a change, then we should just ignore this props change,
    // because there will be another when we hit the trailing edge of the debounce.
    if (this.debouncedOnChangeAndTagCodeMirror) {
      return;
    }

    var selectedChoices = nextProps.selectedChoices;
    var replaceChoices = nextProps.replaceChoices;
    var nextState = {
      replaceChoices: replaceChoices,
      translator: Object(_tag_translator__WEBPACK_IMPORTED_MODULE_4__["default"])(selectedChoices.concat(replaceChoices), this.props.config.humanize)
    }; // Not sure what the null/undefined checks are here for, but changed from falsey which was breaking.

    if (this.state.value !== nextProps.value && !_src_undash__WEBPACK_IMPORTED_MODULE_5__["default"].isUndefined(nextProps.value) && nextProps.value !== null) {
      nextState.value = toString(nextProps.value);

      if (this.state.hasChanged === false) {
        nextState.hasChanged = true;
      }
    }

    this.setState(nextState);
  },
  onChange: function onChange(newValue) {
    this.props.onChange(newValue);
  },
  handleChoiceSelection: function handleChoiceSelection(key, event) {
    var _this = this;

    var selectChoice = function selectChoice() {
      var pos = _this.state.selectedTagPos;
      var tag = '{{' + key + '}}';
      _this.isInserting = true;

      if (pos) {
        _this.codeMirror.replaceRange(tag, {
          line: pos.line,
          ch: pos.start
        }, {
          line: pos.line,
          ch: pos.stop
        });
      } else {
        _this.codeMirror.replaceSelection(tag, 'end');
      }

      _this.isInserting = false;

      _this.codeMirror.focus();

      _this.setState({
        isChoicesOpen: false,
        selectedTagPos: null
      });
    };

    if (this.state.codeMirrorMode) {
      selectChoice();
    } else if (this.props.readOnly) {
      // hackety hack to stop dropdown choices from toggling
      event.stopPropagation();
      this.isInserting = true;
      this.onChange('{{' + key + '}}');
      this.isInserting = false;
      this.setState({
        isChoicesOpen: false
      });
    } else {
      this.switchToCodeMirror(selectChoice);
    }
  },
  onFocusWrapper: function onFocusWrapper() {
    var _this2 = this;

    this.switchToCodeMirror(function () {
      _this2.codeMirror.focus();

      _this2.codeMirror.setCursor(_this2.codeMirror.lineCount(), 0);
    });
  },
  focus: function focus() {
    var _this3 = this;

    if (this.codeMirror) {
      this.focusCodeMirror();
    } else {
      this.switchToCodeMirror(function () {
        _this3.focusCodeMirror();
      });
    }
  },
  focusCodeMirror: function focusCodeMirror() {
    if (this.codeMirror) {
      this.codeMirror.focus();
    }
  },
  onFocusCodeMirror: function onFocusCodeMirror() {
    this.setState({
      hasFocus: true
    });
    this.props.onFocus();
  },
  onBlur: function onBlur() {
    this.setState({
      hasFocus: false
    }, this.props.onBlur);
  },
  insertBtn: function insertBtn() {
    if (this.props.readOnly || this.isReadOnly() && !this.hasReadOnlyControls()) {
      return null;
    }

    var onInsertClick = function onInsertClick() {
      this.setState({
        selectedTagPos: null
      });
      this.onToggleChoices();
    };

    var props = {
      typeName: this.props.typeName,
      ref: Object(_src_utils__WEBPACK_IMPORTED_MODULE_6__["ref"])(this, 'toggle'),
      onClick: onInsertClick.bind(this),
      readOnly: this.isReadOnly(),
      field: this.props.field
    };
    return this.props.config.createElement('insert-button', props, 'Insert...');
  },
  choices: function choices() {
    if (this.isReadOnly()) {
      return null;
    }

    return this.props.config.createElement('choices', {
      typeName: this.props.typeName,
      ref: Object(_src_utils__WEBPACK_IMPORTED_MODULE_6__["ref"])(this, 'choices'),
      onFocusSelect: this.focusCodeMirror,
      choices: this.state.replaceChoices,
      open: this.state.isChoicesOpen,
      ignoreCloseNodes: this.getCloseIgnoreNodes,
      onSelect: this.handleChoiceSelection,
      onClose: this.onCloseChoices,
      isAccordion: this.props.isAccordion,
      field: this.props.field,
      onChoiceAction: this.onChoiceAction
    });
  },
  onChoiceAction: function onChoiceAction(choice) {
    this.setState({
      isChoicesOpen: !!choice.isOpen
    });
    this.onStartAction(choice.action, choice);
  },
  wrapperTabIndex: function wrapperTabIndex() {
    if (this.props.readOnly || this.state.codeMirrorMode) {
      return null;
    }

    return this.props.tabIndex || 0;
  },
  onKeyDown: function onKeyDown(event) {
    if (!this.isReadOnly()) {
      if (event.keyCode === _src_utils__WEBPACK_IMPORTED_MODULE_6__["keyCodes"].ESC) {
        event.preventDefault();
        event.stopPropagation();

        if (this.state.isChoicesOpen) {
          this.onToggleChoices();
          this.focusCodeMirror();
        }
      } else if (!this.state.isChoicesOpen) {// TODO: sane shortcut for opening choices
        // Below does not work yet. Ends up dumping { into search input.
        // if (this.codeMirror) {
        //   if (event.keyCode === keyCodes['['] && event.shiftKey) {
        //     const cursor = this.codeMirror.getCursor();
        //     const value = this.codeMirror.getValue();
        //     const lines = value.split('\n');
        //     const line = lines[cursor.line];
        //     if (line) {
        //       const prevChar = line[cursor.ch - 1];
        //       if (prevChar === '{') {
        //         this.onToggleChoices();
        //       }
        //     }
        //   }
        // }
      } else {
        if (this.choicesRef && this.choicesRef.onKeyDown) {
          this.choicesRef.onKeyDown(event);
        }
      }
    }
  },
  render: function render() {
    return this.renderWithConfig();
  },
  renderDefault: function renderDefault() {
    var textBoxClasses = classnames__WEBPACK_IMPORTED_MODULE_3___default()(_src_undash__WEBPACK_IMPORTED_MODULE_5__["default"].extend({}, this.props.classes, {
      'pretty-text-box': true,
      placeholder: this.hasPlaceholder(),
      'has-focus': this.state.hasFocus
    })); // Render read-only version.

    return Object(_src_jsx__WEBPACK_IMPORTED_MODULE_8__["default"])("div", {
      className: classnames__WEBPACK_IMPORTED_MODULE_3___default()({
        'pretty-text-wrapper': true,
        'choices-open': this.state.isChoicesOpen
      }),
      onKeyDown: this.onKeyDown,
      onMouseEnter: this.switchToCodeMirror,
      onTouchStart: this.switchToCodeMirror,
      renderWith: this.renderWith('PrettyTextInputWrapper'),
      role: "presentation"
    }, Object(_src_jsx__WEBPACK_IMPORTED_MODULE_8__["default"])("div", {
      className: "pretty-text-click-wrapper",
      onFocus: this.onFocusWrapper,
      renderWith: this.renderWith('PrettyTextInputClickWrapper') // we need to handle onFocus events for this div for accessibility
      // when the screen reader enters the field it should be the equivalent
      // of a focus click event
      ,
      role: "textbox",
      tabIndex: "0"
    }, Object(_src_jsx__WEBPACK_IMPORTED_MODULE_8__["default"])("div", {
      className: textBoxClasses,
      onBlur: this.onBlur,
      renderWith: this.renderWith('PrettyTextInputTabTarget'),
      role: "presentation",
      tabIndex: this.wrapperTabIndex()
    }, Object(_src_jsx__WEBPACK_IMPORTED_MODULE_8__["default"])("div", {
      className: "internal-text-wrapper",
      ref: Object(_src_utils__WEBPACK_IMPORTED_MODULE_6__["ref"])(this, 'textBox'),
      renderWith: this.renderWith('PrettyTextInputInternalTextWrapper')
    }))), this.insertBtn(), this.choices());
  },
  getCloseIgnoreNodes: function getCloseIgnoreNodes() {
    return this.toggleRef;
  },
  onToggleChoices: function onToggleChoices() {
    this.setChoicesOpen(!this.state.isChoicesOpen);
  },
  setChoicesOpen: function setChoicesOpen(isOpen) {
    var action = isOpen ? 'open-replacements' : 'close-replacements';
    this.onStartAction(action);
    this.setState({
      isChoicesOpen: isOpen
    });
  },
  onCloseChoices: function onCloseChoices() {
    if (this.state.isChoicesOpen) {
      this.setChoicesOpen(false);
    }
  },
  createEditor: function createEditor() {
    if (this.state.codeMirrorMode) {
      this.createCodeMirrorEditor();
    } else {
      this.createReadonlyEditor();
    }
  },
  updateEditor: function updateEditor() {
    if (this.state.codeMirrorMode) {
      var codeMirrorValue = this.codeMirror.getValue();

      if (!this.hasPlaceholder() && codeMirrorValue !== this.state.value) {
        // switch back to read-only mode to make it easier to render
        this.removeCodeMirrorEditor();
        this.createReadonlyEditor();
        this.setState({
          codeMirrorMode: false
        });
      }
    } else {
      this.createReadonlyEditor();
    }
  },
  maybeSetCursorPosition: function maybeSetCursorPosition(position) {
    if (position && this.codeMirror) {
      this.codeMirror.setCursor(position);
    }
  },
  maybeCodeMirrorOperation: function maybeCodeMirrorOperation(ops) {
    if (this.codeMirror) {
      this.codeMirror.operation(ops);
    }
  },
  createCodeMirrorEditor: function createCodeMirrorEditor() {
    var _this4 = this;

    var options = {
      tabindex: this.props.tabIndex || 0,
      lineWrapping: true,
      placeholder: toString(this.props.config.fieldPlaceholder(this.props.field)),
      value: toString(this.state.value),
      readOnly: false,
      mode: null,
      extraKeys: {
        Tab: false,
        'Shift-Tab': false
      }
    };
    var textBox = this.textBoxRef;
    textBox.innerHTML = ''; // release any previous read-only content so it can be GC'ed

    this.codeMirror = this.props.config.codeMirror()(textBox, options);
    this.codeMirror.on('change', this.onCodeMirrorChange);
    this.codeMirror.on('focus', this.onFocusCodeMirror);
    this.debouncedOnChangeAndTagCodeMirror = _src_undash__WEBPACK_IMPORTED_MODULE_5__["default"].debounce(function () {
      _this4.onChangeAndTagCodeMirror();
    }, 200);
    var pos = this.codeMirror ? this.codeMirror.getCursor() : null;
    this.tagCodeMirror(pos);
  },
  tagCodeMirror: function tagCodeMirror(cursorPosition) {
    var _this5 = this;

    var positions = this.state.translator.getTagPositions(this.codeMirror.getValue());
    var self = this;

    var tagOps = function tagOps() {
      positions.forEach(function (pos) {
        var node = self.createTagNode(pos);
        self.codeMirror.markText({
          line: pos.line,
          ch: pos.start
        }, {
          line: pos.line,
          ch: pos.stop
        }, {
          replacedWith: node,
          handleMouseEvents: true
        });
      });
    }; // Make sure we apply those operations after React has made its rendering pass.
    // As React 16 is asynchronous and uses rAF, it's safe to assume that this will
    // be called after React has patched the DOM.
    //
    // But if we are calling this function from CodeMirror itself, we want to stay
    // in sync with it's internal state.


    if (this.debouncedOnChangeAndTagCodeMirror) {
      this.maybeCodeMirrorOperation(tagOps);
      this.maybeSetCursorPosition(cursorPosition);
    } else {
      requestAnimationFrame(function () {
        _this5.maybeCodeMirrorOperation(tagOps);

        _this5.maybeSetCursorPosition(cursorPosition);
      });
    }
  },
  onChangeAndTagCodeMirror: function onChangeAndTagCodeMirror() {
    this.onChange(this.codeMirror.getValue());
    this.tagCodeMirror();
  },
  onCodeMirrorChange: function onCodeMirrorChange() {
    var newValue = this.codeMirror.getValue();
    this.setState({
      value: newValue
    }); // Immediately change and tag if inserting.

    if (this.isInserting) {
      this.onChangeAndTagCodeMirror();
    } // Otherwise, debounce so CodeMirror doesn't die.
    else {
        this.debouncedOnChangeAndTagCodeMirror();
      }
  },

  /* Return true if we should render the placeholder */
  hasPlaceholder: function hasPlaceholder() {
    return !this.state.value;
  },
  createReadonlyEditor: function createReadonlyEditor() {
    var textBoxNode = this.textBoxRef;

    if (this.hasPlaceholder()) {
      return react_dom__WEBPACK_IMPORTED_MODULE_2___default.a.render(Object(_src_jsx__WEBPACK_IMPORTED_MODULE_8__["default"])("span", {
        renderWith: this.renderWith('PrettyTextInputPlaceholder')
      }, this.props.field.placeholder), textBoxNode);
    }

    var tokens = this.props.config.tokenize(this.state.value);
    var self = this;
    var nodes = tokens.map(function (part, i) {
      if (part.type === 'tag') {
        var label = self.state.translator.getLabel(part.value);
        var props = {
          typeName: self.props.typeName,
          key: i,
          tag: part.value,
          replaceChoices: self.state.replaceChoices,
          field: self.props.field
        };
        return self.props.config.createElement('pretty-tag', props, label);
      }

      return Object(_src_jsx__WEBPACK_IMPORTED_MODULE_8__["default"])("span", {
        key: i
      }, part.value);
    });
    return react_dom__WEBPACK_IMPORTED_MODULE_2___default.a.render(Object(_src_jsx__WEBPACK_IMPORTED_MODULE_8__["default"])("span", {
      renderWith: this.renderWith('PrettyTextInputTokens')
    }, nodes), textBoxNode);
  },
  removeCodeMirrorEditor: function removeCodeMirrorEditor() {
    var textBoxNode = this.textBoxRef;
    var cmNode = textBoxNode.firstChild;
    textBoxNode.removeChild(cmNode);
    this.codeMirror.off('change', this.onCodeMirrorChange);
    this.codeMirror.off('focus', this.onFocusCodeMirror);

    if (this.debouncedOnChangeAndTagCodeMirror) {
      // Cancel any trailing invocation
      this.debouncedOnChangeAndTagCodeMirror.cancel();
      this.debouncedOnChangeAndTagCodeMirror = null; // Flush changes

      this.onChange(this.codeMirror.getValue());
    }

    this.codeMirror = null;
  },
  switchToCodeMirror: function switchToCodeMirror(cb) {
    var _this6 = this;

    if (this.isReadOnly()) {
      return; // never render in code mirror if read-only
    }

    if (!this.props.readOnly) {
      if (!this.state.codeMirrorMode) {
        this.setState({
          codeMirrorMode: true
        }, function () {
          if (_this6.codeMirror && _src_undash__WEBPACK_IMPORTED_MODULE_5__["default"].isFunction(cb)) {
            cb();
          }
        });
      }
    }
  },
  onTagClick: function onTagClick() {
    var cursor = this.codeMirror.getCursor();
    var pos = this.state.translator.getTrueTagPosition(this.state.value, cursor);
    this.setState({
      selectedTagPos: pos
    });
    this.onToggleChoices();
  },
  createTagNode: function createTagNode(pos) {
    var node = document.createElement('span');
    var label = this.state.translator.getLabel(pos.tag);
    var config = this.props.config;
    var props = {
      typeName: this.props.typeName,
      onClick: this.onTagClick,
      field: this.props.field,
      tag: pos.tag
    };
    react_dom__WEBPACK_IMPORTED_MODULE_2___default.a.render(config.createElement('pretty-tag', props, label), node);
    return node;
  }
}));

/***/ })

})
//# sourceMappingURL=demo.js.daf8ba5bf9eee92e6b96.hot-update.js.map