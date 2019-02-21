webpackHotUpdate("static/development/pages/plugins.js",{

/***/ "./pages/plugins.js":
/*!**************************!*\
  !*** ./pages/plugins.js ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(module) {/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/next/node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var isomorphic_unfetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! isomorphic-unfetch */ "./node_modules/isomorphic-unfetch/browser.js");
/* harmony import */ var isomorphic_unfetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(isomorphic_unfetch__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _docs_components_Page__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../docs/components/Page */ "./docs/components/Page.js");
/* harmony import */ var _docs_components_Section__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../docs/components/Section */ "./docs/components/Section.js");
/* harmony import */ var _docs_components_CodeBlock__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../docs/components/CodeBlock */ "./docs/components/CodeBlock.js");
/* harmony import */ var _docs_components_Sections__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../docs/components/Sections */ "./docs/components/Sections.js");
/* harmony import */ var _docs_components_Code__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../docs/components/Code */ "./docs/components/Code.js");
/* harmony import */ var _docs_utils__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../docs/utils */ "./docs/utils.js");


function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }











var Plugins = function Plugins(props) {
  return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_docs_components_Page__WEBPACK_IMPORTED_MODULE_3__["default"], {
    pageKey: "plugins"
  }, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_docs_components_Sections__WEBPACK_IMPORTED_MODULE_6__["default"], null, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_docs_components_Section__WEBPACK_IMPORTED_MODULE_4__["default"], {
    title: "Config"
  }, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("p", null, "Plugins are simply functions that help to create a configuration object that is passed into Formatic, so first let's talk about the config."), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("p", null, "Almost all of Formatic's behavior is passed in via the", ' ', react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_docs_components_Code__WEBPACK_IMPORTED_MODULE_7__["default"], null, "config"), " property. If you pass in no config, then Formatic uses it's own", ' ', react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("a", {
    href: "https://github.com/zapier/formatic/blob/master/lib/default-config.js"
  }, "default config plugin"), ' ', "to create a config for you. To change Formatic's behavior, you simply pass in a config object with different methods."), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("p", null, "Passing in no config:"), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_docs_components_CodeBlock__WEBPACK_IMPORTED_MODULE_5__["default"], {
    language: "javascript"
  }, props.snippets['plugin-no-config']), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("p", null, "Is equivalent to this:"), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_docs_components_CodeBlock__WEBPACK_IMPORTED_MODULE_5__["default"], {
    language: "javascript"
  }, props.snippets['plugin-default-config'])), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_docs_components_Section__WEBPACK_IMPORTED_MODULE_4__["default"], {
    title: "A Simple Plugin Example"
  }, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("p", null, "Plugins are just functions that help in the creation of a config. Here's a simple plugin that will will use the key instead of the label of a field if the label is not present."), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_docs_components_CodeBlock__WEBPACK_IMPORTED_MODULE_5__["default"], {
    language: "javascript"
  }, props.snippets['plugin-fieldLabel']), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("p", null, "Note that plugin functions receive the config as a parameter, so you can delegate to other methods on the config. Let's \"humanize\" our key by calling the ", react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_docs_components_Code__WEBPACK_IMPORTED_MODULE_7__["default"], null, "config.humanize"), " method on the config."), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_docs_components_CodeBlock__WEBPACK_IMPORTED_MODULE_5__["default"], {
    language: "javascript"
  }, props.snippets['plugin-humanize']), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("p", null, "Also note that at the point in time config is passed in, it's had all previous plugins applied. So you can save any existing methods for wrapping. Here, we'll delegate back to the original", ' ', react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_docs_components_Code__WEBPACK_IMPORTED_MODULE_7__["default"], null, "fieldLabel"), " method."), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_docs_components_CodeBlock__WEBPACK_IMPORTED_MODULE_5__["default"], {
    language: "javascript"
  }, props.snippets['plugin-delegate'])), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_docs_components_Section__WEBPACK_IMPORTED_MODULE_4__["default"], {
    title: "Using Plugins"
  }, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("p", null, "To use a plugin, just pass it in to ", react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_docs_components_Code__WEBPACK_IMPORTED_MODULE_7__["default"], null, "Formatic.createConfig"), "."), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_docs_components_CodeBlock__WEBPACK_IMPORTED_MODULE_5__["default"], {
    language: "javascript"
  }, props.snippets['plugin-using']), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("p", null, "You can pass in multiple plugins. If multiple plugins define the same method, the config will get the method from the last plugin. As shown above though, each plugin's method can delegate to an earlier plugin's method."), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_docs_components_CodeBlock__WEBPACK_IMPORTED_MODULE_5__["default"], {
    language: "javascript"
  }, props.snippets['plugin-using-multiple'])), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_docs_components_Section__WEBPACK_IMPORTED_MODULE_4__["default"], {
    title: "Adding Field Types"
  }, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("p", null, "To add a new field type, you can use the `FieldContainer` component to create the field component, and you point to it with a plugin."), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_docs_components_CodeBlock__WEBPACK_IMPORTED_MODULE_5__["default"], {
    language: "jsx"
  }, props.snippets['plugin-field-type']))));
};

var snippetKeys = ['plugin-no-config', 'plugin-default-config', 'plugin-fieldLabel', 'plugin-humanize', 'plugin-delegate', 'plugin-using', 'plugin-using-multiple', 'plugin-field-type'];

Plugins.getInitialProps =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee(_ref) {
    var req;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            req = _ref.req;
            return _context.abrupt("return", {
              snippets: Object(_docs_utils__WEBPACK_IMPORTED_MODULE_8__["loadSnippets"])(snippetKeys)
            });

          case 2:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();

/* harmony default export */ __webpack_exports__["default"] = (Plugins);
    (function (Component, route) {
      if(!Component) return
      if (false) {}
      module.hot.accept()
      Component.__route = route

      if (module.hot.status() === 'idle') return

      var components = next.router.components
      for (var r in components) {
        if (!components.hasOwnProperty(r)) continue

        if (components[r].Component.__route === route) {
          next.router.update(r, Component)
        }
      }
    })(typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__.default : (module.exports.default || module.exports), "/plugins")
  
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/harmony-module.js */ "./node_modules/webpack/buildin/harmony-module.js")(module)))

/***/ })

})
//# sourceMappingURL=plugins.js.cf3315cc3ec62259a63e.hot-update.js.map