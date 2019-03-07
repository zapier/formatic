webpackHotUpdate("static/development/pages/demo.js",{

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

var dynamicReplaceChoices = {};

var loadDynamicReplaceChoices = function loadDynamicReplaceChoices(field) {
  if (field.dynamicReplaceChoices && !dynamicReplaceChoices[field.key]) {
    console.info("loading choices for ".concat(field.key, "..."));
    setTimeout(function () {
      dynamicReplaceChoices[field.key] = field.dynamicReplaceChoices;
      console.info('loaded:', field.dynamicReplaceChoices);
    }, 2000);
  }
}; // Simulate dynamic replace choices.


var fakeDynamicPlugin = function fakeDynamicPlugin(_ref) {
  var _fieldReplaceChoices = _ref.fieldReplaceChoices;
  return {
    fieldReplaceChoices: function fieldReplaceChoices(field) {
      if (field.dynamicReplaceChoices) {
        if (dynamicReplaceChoices[field.key]) {
          return dynamicReplaceChoices[field.key];
        }

        return [{
          value: '///loading///'
        }];
      }

      return _fieldReplaceChoices(field);
    }
  };
};

var config = _src_formatic__WEBPACK_IMPORTED_MODULE_11__["default"].createConfig(_src_plugins_css_plugin__WEBPACK_IMPORTED_MODULE_18__["default"], _src_formatic__WEBPACK_IMPORTED_MODULE_11__["default"].plugins.reference, _src_formatic__WEBPACK_IMPORTED_MODULE_11__["default"].plugins.meta, _demo_examples_custom_plugin__WEBPACK_IMPORTED_MODULE_17__["default"], fakeDynamicPlugin);
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
          loadDynamicReplaceChoices(info.field);

          _this2.onCustomEvent('onOpenReplacements', info);
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

/***/ })

})
//# sourceMappingURL=demo.js.d75d0372073114616d47.hot-update.js.map