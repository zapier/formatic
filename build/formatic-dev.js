!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Formatic=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/justin/git/formatic/index.js":[function(require,module,exports){
// # index

// Export the Formatic React class at the top level.
'use strict';

module.exports = require('./lib/formatic');

},{"./lib/formatic":"/Users/justin/git/formatic/lib/formatic.js"}],"/Users/justin/git/formatic/lib/components/containers/object.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

var _undash = require('../../undash');

var _undash2 = _interopRequireDefault(_undash);

var _reactUtils = require('../../react-utils');

var ObjectContainer = _react2['default'].createClass({
  displayName: 'ObjectContainer',

  propTypes: {
    value: _react2['default'].PropTypes.object,
    onChange: _react2['default'].PropTypes.func.isRequired,
    components: _react2['default'].PropTypes.object.isRequired
  },

  value: function value() {
    var value = this.props.value;

    if (_undash2['default'].isUndefined(value)) {
      return {};
    }
    return value;
  },

  onChangeChild: function onChangeChild(newChildValue, info) {
    var key = info.path[0];
    var newValue = _undash2['default'].extend({}, this.value(), _defineProperty({}, key, newChildValue));
    this.props.onChange(newValue, info);
  },

  childContextTypes: {
    onChangeChild: _react2['default'].PropTypes.func.isRequired,
    components: _react2['default'].PropTypes.object.isRequired
  },

  getChildContext: function getChildContext() {
    return {
      onChangeChild: this.onChangeChild,
      components: this.props.components
    };
  },

  render: function render() {
    var props = this.getChildContext();
    if (this.props.onRender) {
      props.onRender = this.props.onRender;
    }
    return (0, _reactUtils.cloneChild)(this.props.children, props);
  }
});

exports['default'] = ObjectContainer;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qdXN0aW4vZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2NvbnRhaW5lcnMvb2JqZWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O3FCQUFrQixPQUFPOzs7O3NCQUVYLGNBQWM7Ozs7MEJBQ0gsbUJBQW1COztBQUU1QyxJQUFNLGVBQWUsR0FBRyxtQkFBTSxXQUFXLENBQUM7OztBQUV4QyxXQUFTLEVBQUU7QUFDVCxTQUFLLEVBQUUsbUJBQU0sU0FBUyxDQUFDLE1BQU07QUFDN0IsWUFBUSxFQUFFLG1CQUFNLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUN6QyxjQUFVLEVBQUUsbUJBQU0sU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0dBQzlDOztBQUVELE9BQUssRUFBQSxpQkFBRztRQUNDLEtBQUssR0FBSSxJQUFJLENBQUMsS0FBSyxDQUFuQixLQUFLOztBQUNaLFFBQUksb0JBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3hCLGFBQU8sRUFBRSxDQUFDO0tBQ1g7QUFDRCxXQUFPLEtBQUssQ0FBQztHQUNkOztBQUVELGVBQWEsRUFBQSx1QkFBQyxhQUFhLEVBQUUsSUFBSSxFQUFFO0FBQ2pDLFFBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekIsUUFBTSxRQUFRLEdBQUcsb0JBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLHNCQUN2QyxHQUFHLEVBQUcsYUFBYSxFQUNwQixDQUFDO0FBQ0gsUUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQ3JDOztBQUVELG1CQUFpQixFQUFFO0FBQ2pCLGlCQUFhLEVBQUUsbUJBQU0sU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQzlDLGNBQVUsRUFBRSxtQkFBTSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7R0FDOUM7O0FBRUQsaUJBQWUsRUFBQSwyQkFBRztBQUNoQixXQUFPO0FBQ0wsbUJBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtBQUNqQyxnQkFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVTtLQUNsQyxDQUFDO0dBQ0g7O0FBRUQsUUFBTSxFQUFBLGtCQUFHO0FBQ1AsUUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQ3JDLFFBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7QUFDdkIsV0FBSyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztLQUN0QztBQUNELFdBQU8sNEJBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7R0FDL0M7Q0FDRixDQUFDLENBQUM7O3FCQUVZLGVBQWUiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCB1IGZyb20gJy4uLy4uL3VuZGFzaCc7XG5pbXBvcnQge2Nsb25lQ2hpbGR9IGZyb20gJy4uLy4uL3JlYWN0LXV0aWxzJztcblxuY29uc3QgT2JqZWN0Q29udGFpbmVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHByb3BUeXBlczoge1xuICAgIHZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LFxuICAgIG9uQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIGNvbXBvbmVudHM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZFxuICB9LFxuXG4gIHZhbHVlKCkge1xuICAgIGNvbnN0IHt2YWx1ZX0gPSB0aGlzLnByb3BzO1xuICAgIGlmICh1LmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH0sXG5cbiAgb25DaGFuZ2VDaGlsZChuZXdDaGlsZFZhbHVlLCBpbmZvKSB7XG4gICAgY29uc3Qga2V5ID0gaW5mby5wYXRoWzBdO1xuICAgIGNvbnN0IG5ld1ZhbHVlID0gdS5leHRlbmQoe30sIHRoaXMudmFsdWUoKSwge1xuICAgICAgW2tleV06IG5ld0NoaWxkVmFsdWVcbiAgICB9KTtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlLCBpbmZvKTtcbiAgfSxcblxuICBjaGlsZENvbnRleHRUeXBlczoge1xuICAgIG9uQ2hhbmdlQ2hpbGQ6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgY29tcG9uZW50czogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkXG4gIH0sXG5cbiAgZ2V0Q2hpbGRDb250ZXh0KCkge1xuICAgIHJldHVybiB7XG4gICAgICBvbkNoYW5nZUNoaWxkOiB0aGlzLm9uQ2hhbmdlQ2hpbGQsXG4gICAgICBjb21wb25lbnRzOiB0aGlzLnByb3BzLmNvbXBvbmVudHNcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwcm9wcyA9IHRoaXMuZ2V0Q2hpbGRDb250ZXh0KCk7XG4gICAgaWYgKHRoaXMucHJvcHMub25SZW5kZXIpIHtcbiAgICAgIHByb3BzLm9uUmVuZGVyID0gdGhpcy5wcm9wcy5vblJlbmRlcjtcbiAgICB9XG4gICAgcmV0dXJuIGNsb25lQ2hpbGQodGhpcy5wcm9wcy5jaGlsZHJlbiwgcHJvcHMpO1xuICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgT2JqZWN0Q29udGFpbmVyO1xuIl19
},{"../../react-utils":"/Users/justin/git/formatic/lib/react-utils.js","../../undash":"/Users/justin/git/formatic/lib/undash.js"}],"/Users/justin/git/formatic/lib/components/containers/string-input.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

var _reactUtils = require('../../react-utils');

var StringInputContainer = _react2['default'].createClass({
  displayName: 'StringInputContainer',

  propTypes: {
    value: _react2['default'].PropTypes.string.isRequired,
    onChange: _react2['default'].PropTypes.func.isRequired
  },

  render: function render() {
    var _props = this.props;
    var children = _props.children;

    var props = _objectWithoutProperties(_props, ['children']);

    return (0, _reactUtils.cloneChild)(this.props.children, props);
  }
});

exports['default'] = StringInputContainer;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qdXN0aW4vZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2NvbnRhaW5lcnMvc3RyaW5nLWlucHV0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O3FCQUFrQixPQUFPOzs7OzBCQUVBLG1CQUFtQjs7QUFFNUMsSUFBTSxvQkFBb0IsR0FBRyxtQkFBTSxXQUFXLENBQUM7OztBQUU3QyxXQUFTLEVBQUU7QUFDVCxTQUFLLEVBQUUsbUJBQU0sU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ3hDLFlBQVEsRUFBRSxtQkFBTSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7R0FDMUM7O0FBRUQsUUFBTSxFQUFBLGtCQUFHO2lCQUNzQixJQUFJLENBQUMsS0FBSztRQUFoQyxRQUFRLFVBQVIsUUFBUTs7UUFBSyxLQUFLOztBQUV6QixXQUFPLDRCQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0dBQy9DO0NBQ0YsQ0FBQyxDQUFDOztxQkFFWSxvQkFBb0IiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCB7Y2xvbmVDaGlsZH0gZnJvbSAnLi4vLi4vcmVhY3QtdXRpbHMnO1xuXG5jb25zdCBTdHJpbmdJbnB1dENvbnRhaW5lciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBwcm9wVHlwZXM6IHtcbiAgICB2YWx1ZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIG9uQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkXG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtjaGlsZHJlbiwgLi4ucHJvcHN9ID0gdGhpcy5wcm9wcztcblxuICAgIHJldHVybiBjbG9uZUNoaWxkKHRoaXMucHJvcHMuY2hpbGRyZW4sIHByb3BzKTtcbiAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IFN0cmluZ0lucHV0Q29udGFpbmVyO1xuIl19
},{"../../react-utils":"/Users/justin/git/formatic/lib/react-utils.js"}],"/Users/justin/git/formatic/lib/components/create-field.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

var createField = function createField(Input) {
  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var name = _ref.name;

  if (!name) {
    if (Input.displayName.indexOf('Input') > 0) {
      name = Input.displayName.substring(0, Input.displayName.indexOf('Input'));
    }
  }

  if (!name) {
    throw new Error('Field requires a displayName.');
  }

  var FieldInput = _react2['default'].createClass({

    displayName: name,

    propTypes: {
      components: _react2['default'].PropTypes.object.isRequired
    },

    render: function render() {
      var Field = this.props.components.Field;

      return _react2['default'].createElement(
        Field,
        this.props,
        _react2['default'].createElement(Input, this.props)
      );
    }
  });

  return FieldInput;
};

exports['default'] = createField;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qdXN0aW4vZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2NyZWF0ZS1maWVsZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7cUJBQWtCLE9BQU87Ozs7QUFFekIsSUFBTSxXQUFXLEdBQUcsU0FBZCxXQUFXLENBQUksS0FBSyxFQUFrQjttRUFBUCxFQUFFOztNQUFWLElBQUksUUFBSixJQUFJOztBQUUvQixNQUFJLENBQUMsSUFBSSxFQUFFO0FBQ1QsUUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDMUMsVUFBSSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQzNFO0dBQ0Y7O0FBRUQsTUFBSSxDQUFDLElBQUksRUFBRTtBQUNULFVBQU0sSUFBSSxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztHQUNsRDs7QUFFRCxNQUFNLFVBQVUsR0FBRyxtQkFBTSxXQUFXLENBQUM7O0FBRW5DLGVBQVcsRUFBRSxJQUFJOztBQUVqQixhQUFTLEVBQUU7QUFDVCxnQkFBVSxFQUFFLG1CQUFNLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtLQUM5Qzs7QUFFRCxVQUFNLEVBQUEsa0JBQUc7VUFFQSxLQUFLLEdBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQTlCLEtBQUs7O0FBRVosYUFDRTtBQUFDLGFBQUs7UUFBSyxJQUFJLENBQUMsS0FBSztRQUNuQixpQ0FBQyxLQUFLLEVBQUssSUFBSSxDQUFDLEtBQUssQ0FBRztPQUNsQixDQUNSO0tBQ0g7R0FDRixDQUFDLENBQUM7O0FBRUgsU0FBTyxVQUFVLENBQUM7Q0FDbkIsQ0FBQzs7cUJBRWEsV0FBVyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuY29uc3QgY3JlYXRlRmllbGQgPSAoSW5wdXQsIHtuYW1lfSA9IHt9KSA9PiB7XG5cbiAgaWYgKCFuYW1lKSB7XG4gICAgaWYgKElucHV0LmRpc3BsYXlOYW1lLmluZGV4T2YoJ0lucHV0JykgPiAwKSB7XG4gICAgICBuYW1lID0gSW5wdXQuZGlzcGxheU5hbWUuc3Vic3RyaW5nKDAsIElucHV0LmRpc3BsYXlOYW1lLmluZGV4T2YoJ0lucHV0JykpO1xuICAgIH1cbiAgfVxuXG4gIGlmICghbmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignRmllbGQgcmVxdWlyZXMgYSBkaXNwbGF5TmFtZS4nKTtcbiAgfVxuXG4gIGNvbnN0IEZpZWxkSW5wdXQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogbmFtZSxcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgY29tcG9uZW50czogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkXG4gICAgfSxcblxuICAgIHJlbmRlcigpIHtcblxuICAgICAgY29uc3Qge0ZpZWxkfSA9IHRoaXMucHJvcHMuY29tcG9uZW50cztcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPEZpZWxkIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgICA8SW5wdXQgey4uLnRoaXMucHJvcHN9Lz5cbiAgICAgICAgPC9GaWVsZD5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gRmllbGRJbnB1dDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUZpZWxkO1xuIl19
},{}],"/Users/justin/git/formatic/lib/components/helpers/field.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

var Field = _react2['default'].createClass({
  displayName: 'Field',

  propTypes: {
    components: _react2['default'].PropTypes.object.isRequired
  },

  render: function render() {
    var _props$components = this.props.components;
    var Label = _props$components.Label;
    var Help = _props$components.Help;

    return _react2['default'].createElement(
      'div',
      null,
      _react2['default'].createElement(Label, this.props),
      _react2['default'].createElement(Help, this.props),
      this.props.children
    );
  }
});

exports['default'] = Field;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qdXN0aW4vZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvZmllbGQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O3FCQUFrQixPQUFPOzs7O0FBRXpCLElBQU0sS0FBSyxHQUFHLG1CQUFNLFdBQVcsQ0FBQzs7O0FBRTlCLFdBQVMsRUFBRTtBQUNULGNBQVUsRUFBRSxtQkFBTSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7R0FDOUM7O0FBRUQsUUFBTSxFQUFBLGtCQUFHOzRCQUNlLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVTtRQUFwQyxLQUFLLHFCQUFMLEtBQUs7UUFBRSxJQUFJLHFCQUFKLElBQUk7O0FBRWxCLFdBQ0U7OztNQUNFLGlDQUFDLEtBQUssRUFBSyxJQUFJLENBQUMsS0FBSyxDQUFHO01BQ3hCLGlDQUFDLElBQUksRUFBSyxJQUFJLENBQUMsS0FBSyxDQUFHO01BQ3RCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUTtLQUNoQixDQUNOO0dBQ0g7Q0FDRixDQUFDLENBQUM7O3FCQUVZLEtBQUsiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmNvbnN0IEZpZWxkID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHByb3BUeXBlczoge1xuICAgIGNvbXBvbmVudHM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZFxuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7TGFiZWwsIEhlbHB9ID0gdGhpcy5wcm9wcy5jb21wb25lbnRzO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxMYWJlbCB7Li4udGhpcy5wcm9wc30vPlxuICAgICAgICA8SGVscCB7Li4udGhpcy5wcm9wc30vPlxuICAgICAgICB7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBGaWVsZDtcbiJdfQ==
},{}],"/Users/justin/git/formatic/lib/components/helpers/help.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

var Help = _react2['default'].createClass({
  displayName: 'Help',

  render: function render() {
    var help = this.props.help;

    return !help ? null : _react2['default'].createElement(
      'div',
      null,
      help
    );
  }
});

exports['default'] = Help;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qdXN0aW4vZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvaGVscC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7cUJBQWtCLE9BQU87Ozs7QUFFekIsSUFBTSxJQUFJLEdBQUcsbUJBQU0sV0FBVyxDQUFDOzs7QUFFN0IsUUFBTSxFQUFBLGtCQUFHO1FBQ0EsSUFBSSxHQUFJLElBQUksQ0FBQyxLQUFLLENBQWxCLElBQUk7O0FBRVgsV0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQ2pCOzs7TUFDRyxJQUFJO0tBQ0QsQUFDUCxDQUFDO0dBQ0g7Q0FDRixDQUFDLENBQUM7O3FCQUVZLElBQUkiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmNvbnN0IEhlbHAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtoZWxwfSA9IHRoaXMucHJvcHM7XG5cbiAgICByZXR1cm4gIWhlbHAgPyBudWxsIDogKFxuICAgICAgPGRpdj5cbiAgICAgICAge2hlbHB9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgSGVscDtcbiJdfQ==
},{}],"/Users/justin/git/formatic/lib/components/helpers/label.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

var Label = _react2['default'].createClass({
  displayName: 'Label',

  render: function render() {
    var _props$label = this.props.label;
    var label = _props$label === undefined ? '' : _props$label;

    return _react2['default'].createElement(
      'div',
      null,
      label
    );
  }
});

exports['default'] = Label;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qdXN0aW4vZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvbGFiZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O3FCQUFrQixPQUFPOzs7O0FBRXpCLElBQU0sS0FBSyxHQUFHLG1CQUFNLFdBQVcsQ0FBQzs7O0FBRTlCLFFBQU0sRUFBQSxrQkFBRzt1QkFDYyxJQUFJLENBQUMsS0FBSyxDQUF4QixLQUFLO1FBQUwsS0FBSyxnQ0FBRyxFQUFFOztBQUVqQixXQUNFOzs7TUFDRyxLQUFLO0tBQ0YsQ0FDTjtHQUNIO0NBQ0YsQ0FBQyxDQUFDOztxQkFFWSxLQUFLIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5jb25zdCBMYWJlbCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge2xhYmVsID0gJyd9ID0gdGhpcy5wcm9wcztcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICB7bGFiZWx9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgTGFiZWw7XG4iXX0=
},{}],"/Users/justin/git/formatic/lib/components/index.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

var _undash = require('../undash');

var _undash2 = _interopRequireDefault(_undash);

var _wrapInput = require('./wrap-input');

var _wrapInput2 = _interopRequireDefault(_wrapInput);

var _wrapPure = require('./wrap-pure');

var _wrapPure2 = _interopRequireDefault(_wrapPure);

var _wrapChildInput = require('./wrap-child-input');

var _wrapChildInput2 = _interopRequireDefault(_wrapChildInput);

var _createField = require('./create-field');

var _createField2 = _interopRequireDefault(_createField);

var _useContext = require('./use-context');

var _useContext2 = _interopRequireDefault(_useContext);

var _inputsString = require('./inputs/string');

var _inputsString2 = _interopRequireDefault(_inputsString);

var _containersStringInput = require('./containers/string-input');

var _containersStringInput2 = _interopRequireDefault(_containersStringInput);

var _containersObject = require('./containers/object');

var _containersObject2 = _interopRequireDefault(_containersObject);

var _helpersField = require('./helpers/field');

var _helpersField2 = _interopRequireDefault(_helpersField);

var _helpersHelp = require('./helpers/help');

var _helpersHelp2 = _interopRequireDefault(_helpersHelp);

var _helpersLabel = require('./helpers/label');

var _helpersLabel2 = _interopRequireDefault(_helpersLabel);

var rawInputComponents = {
  StringInput: _inputsString2['default'],
  StringInputContainer: _containersStringInput2['default']
};

var components = {
  WithContext: {}
};

var useContextParam = {
  contextTypes: {
    onChangeChild: _react2['default'].PropTypes.func.isRequired,
    components: _react2['default'].PropTypes.object.isRequired
  },
  contextToProps: { onChangeChild: 'onChange', components: 'components' }
};

Object.keys(rawInputComponents).forEach(function (key) {
  var RawInputComponent = rawInputComponents[key];
  var PureComponent = (0, _wrapPure2['default'])(RawInputComponent);
  PureComponent.hasEvent = RawInputComponent.hasEvent;
  var InputComponent = (0, _wrapInput2['default'])(PureComponent);
  components[key] = InputComponent;
  var ChildInputComponent = (0, _wrapChildInput2['default'])(InputComponent);
  components['Child' + key] = ChildInputComponent;
  components.WithContext['Child' + key] = (0, _useContext2['default'])(ChildInputComponent, useContextParam);
});

var inputTypes = ['String'];

inputTypes.forEach(function (inputType) {
  var InputComponent = components[inputType + 'Input'];
  var FieldComponent = (0, _createField2['default'])(InputComponent);
  components[inputType + 'Field'] = FieldComponent;
  var ChildFieldComponent = (0, _wrapChildInput2['default'])(FieldComponent);
  components['Child' + inputType + 'Field'] = ChildFieldComponent;
  components.WithContext['Child' + inputType + 'Field'] = (0, _useContext2['default'])(ChildFieldComponent, useContextParam);
});

_undash2['default'].extend(components, {
  ObjectContainer: _containersObject2['default'],
  Field: _helpersField2['default'],
  Help: _helpersHelp2['default'],
  Label: _helpersLabel2['default']
});

exports['default'] = components;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qdXN0aW4vZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztxQkFBa0IsT0FBTzs7OztzQkFFWCxXQUFXOzs7O3lCQUNILGNBQWM7Ozs7d0JBQ2YsYUFBYTs7Ozs4QkFDUCxvQkFBb0I7Ozs7MkJBQ3ZCLGdCQUFnQjs7OzswQkFDakIsZUFBZTs7Ozs0QkFFZCxpQkFBaUI7Ozs7cUNBQ1IsMkJBQTJCOzs7O2dDQUVoQyxxQkFBcUI7Ozs7NEJBRS9CLGlCQUFpQjs7OzsyQkFDbEIsZ0JBQWdCOzs7OzRCQUNmLGlCQUFpQjs7OztBQUVuQyxJQUFNLGtCQUFrQixHQUFHO0FBQ3pCLGFBQVcsMkJBQUE7QUFDWCxzQkFBb0Isb0NBQUE7Q0FDckIsQ0FBQzs7QUFFRixJQUFNLFVBQVUsR0FBRztBQUNqQixhQUFXLEVBQUUsRUFBRTtDQUNoQixDQUFDOztBQUVGLElBQU0sZUFBZSxHQUFHO0FBQ3RCLGNBQVksRUFBRTtBQUNaLGlCQUFhLEVBQUUsbUJBQU0sU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQzlDLGNBQVUsRUFBRSxtQkFBTSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7R0FDOUM7QUFDRCxnQkFBYyxFQUFFLEVBQUMsYUFBYSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFDO0NBQ3RFLENBQUM7O0FBRUYsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUcsRUFBSTtBQUM3QyxNQUFNLGlCQUFpQixHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sYUFBYSxHQUFHLDJCQUFTLGlCQUFpQixDQUFDLENBQUM7QUFDbEQsZUFBYSxDQUFDLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQyxRQUFRLENBQUM7QUFDcEQsTUFBTSxjQUFjLEdBQUcsNEJBQVUsYUFBYSxDQUFDLENBQUM7QUFDaEQsWUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGNBQWMsQ0FBQztBQUNqQyxNQUFNLG1CQUFtQixHQUFHLGlDQUFlLGNBQWMsQ0FBQyxDQUFDO0FBQzNELFlBQVUsV0FBUyxHQUFHLENBQUcsR0FBRyxtQkFBbUIsQ0FBQztBQUNoRCxZQUFVLENBQUMsV0FBVyxXQUFTLEdBQUcsQ0FBRyxHQUFHLDZCQUFXLG1CQUFtQixFQUFFLGVBQWUsQ0FBQyxDQUFDO0NBQzFGLENBQUMsQ0FBQzs7QUFFSCxJQUFNLFVBQVUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUU5QixVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsU0FBUyxFQUFJO0FBQzlCLE1BQU0sY0FBYyxHQUFHLFVBQVUsQ0FBSSxTQUFTLFdBQVEsQ0FBQztBQUN2RCxNQUFNLGNBQWMsR0FBRyw4QkFBWSxjQUFjLENBQUMsQ0FBQztBQUNuRCxZQUFVLENBQUksU0FBUyxXQUFRLEdBQUcsY0FBYyxDQUFDO0FBQ2pELE1BQU0sbUJBQW1CLEdBQUcsaUNBQWUsY0FBYyxDQUFDLENBQUM7QUFDM0QsWUFBVSxXQUFTLFNBQVMsV0FBUSxHQUFHLG1CQUFtQixDQUFDO0FBQzNELFlBQVUsQ0FBQyxXQUFXLFdBQVMsU0FBUyxXQUFRLEdBQUcsNkJBQVcsbUJBQW1CLEVBQUUsZUFBZSxDQUFDLENBQUM7Q0FDckcsQ0FBQyxDQUFDOztBQUVILG9CQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUU7QUFDbkIsaUJBQWUsK0JBQUE7QUFDZixPQUFLLDJCQUFBO0FBQ0wsTUFBSSwwQkFBQTtBQUNKLE9BQUssMkJBQUE7Q0FDTixDQUFDLENBQUM7O3FCQUVZLFVBQVUiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCB1IGZyb20gJy4uL3VuZGFzaCc7XG5pbXBvcnQgd3JhcElucHV0IGZyb20gJy4vd3JhcC1pbnB1dCc7XG5pbXBvcnQgd3JhcFB1cmUgZnJvbSAnLi93cmFwLXB1cmUnO1xuaW1wb3J0IHdyYXBDaGlsZElucHV0IGZyb20gJy4vd3JhcC1jaGlsZC1pbnB1dCc7XG5pbXBvcnQgY3JlYXRlRmllbGQgZnJvbSAnLi9jcmVhdGUtZmllbGQnO1xuaW1wb3J0IHVzZUNvbnRleHQgZnJvbSAnLi91c2UtY29udGV4dCc7XG5cbmltcG9ydCBTdHJpbmdJbnB1dCBmcm9tICcuL2lucHV0cy9zdHJpbmcnO1xuaW1wb3J0IFN0cmluZ0lucHV0Q29udGFpbmVyIGZyb20gJy4vY29udGFpbmVycy9zdHJpbmctaW5wdXQnO1xuXG5pbXBvcnQgT2JqZWN0Q29udGFpbmVyIGZyb20gJy4vY29udGFpbmVycy9vYmplY3QnO1xuXG5pbXBvcnQgRmllbGQgZnJvbSAnLi9oZWxwZXJzL2ZpZWxkJztcbmltcG9ydCBIZWxwIGZyb20gJy4vaGVscGVycy9oZWxwJztcbmltcG9ydCBMYWJlbCBmcm9tICcuL2hlbHBlcnMvbGFiZWwnO1xuXG5jb25zdCByYXdJbnB1dENvbXBvbmVudHMgPSB7XG4gIFN0cmluZ0lucHV0LFxuICBTdHJpbmdJbnB1dENvbnRhaW5lclxufTtcblxuY29uc3QgY29tcG9uZW50cyA9IHtcbiAgV2l0aENvbnRleHQ6IHt9XG59O1xuXG5jb25zdCB1c2VDb250ZXh0UGFyYW0gPSB7XG4gIGNvbnRleHRUeXBlczoge1xuICAgIG9uQ2hhbmdlQ2hpbGQ6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgY29tcG9uZW50czogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkXG4gIH0sXG4gIGNvbnRleHRUb1Byb3BzOiB7b25DaGFuZ2VDaGlsZDogJ29uQ2hhbmdlJywgY29tcG9uZW50czogJ2NvbXBvbmVudHMnfVxufTtcblxuT2JqZWN0LmtleXMocmF3SW5wdXRDb21wb25lbnRzKS5mb3JFYWNoKGtleSA9PiB7XG4gIGNvbnN0IFJhd0lucHV0Q29tcG9uZW50ID0gcmF3SW5wdXRDb21wb25lbnRzW2tleV07XG4gIGNvbnN0IFB1cmVDb21wb25lbnQgPSB3cmFwUHVyZShSYXdJbnB1dENvbXBvbmVudCk7XG4gIFB1cmVDb21wb25lbnQuaGFzRXZlbnQgPSBSYXdJbnB1dENvbXBvbmVudC5oYXNFdmVudDtcbiAgY29uc3QgSW5wdXRDb21wb25lbnQgPSB3cmFwSW5wdXQoUHVyZUNvbXBvbmVudCk7XG4gIGNvbXBvbmVudHNba2V5XSA9IElucHV0Q29tcG9uZW50O1xuICBjb25zdCBDaGlsZElucHV0Q29tcG9uZW50ID0gd3JhcENoaWxkSW5wdXQoSW5wdXRDb21wb25lbnQpO1xuICBjb21wb25lbnRzW2BDaGlsZCR7a2V5fWBdID0gQ2hpbGRJbnB1dENvbXBvbmVudDtcbiAgY29tcG9uZW50cy5XaXRoQ29udGV4dFtgQ2hpbGQke2tleX1gXSA9IHVzZUNvbnRleHQoQ2hpbGRJbnB1dENvbXBvbmVudCwgdXNlQ29udGV4dFBhcmFtKTtcbn0pO1xuXG5jb25zdCBpbnB1dFR5cGVzID0gWydTdHJpbmcnXTtcblxuaW5wdXRUeXBlcy5mb3JFYWNoKGlucHV0VHlwZSA9PiB7XG4gIGNvbnN0IElucHV0Q29tcG9uZW50ID0gY29tcG9uZW50c1tgJHtpbnB1dFR5cGV9SW5wdXRgXTtcbiAgY29uc3QgRmllbGRDb21wb25lbnQgPSBjcmVhdGVGaWVsZChJbnB1dENvbXBvbmVudCk7XG4gIGNvbXBvbmVudHNbYCR7aW5wdXRUeXBlfUZpZWxkYF0gPSBGaWVsZENvbXBvbmVudDtcbiAgY29uc3QgQ2hpbGRGaWVsZENvbXBvbmVudCA9IHdyYXBDaGlsZElucHV0KEZpZWxkQ29tcG9uZW50KTtcbiAgY29tcG9uZW50c1tgQ2hpbGQke2lucHV0VHlwZX1GaWVsZGBdID0gQ2hpbGRGaWVsZENvbXBvbmVudDtcbiAgY29tcG9uZW50cy5XaXRoQ29udGV4dFtgQ2hpbGQke2lucHV0VHlwZX1GaWVsZGBdID0gdXNlQ29udGV4dChDaGlsZEZpZWxkQ29tcG9uZW50LCB1c2VDb250ZXh0UGFyYW0pO1xufSk7XG5cbnUuZXh0ZW5kKGNvbXBvbmVudHMsIHtcbiAgT2JqZWN0Q29udGFpbmVyLFxuICBGaWVsZCxcbiAgSGVscCxcbiAgTGFiZWxcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBjb21wb25lbnRzO1xuIl19
},{"../undash":"/Users/justin/git/formatic/lib/undash.js","./containers/object":"/Users/justin/git/formatic/lib/components/containers/object.js","./containers/string-input":"/Users/justin/git/formatic/lib/components/containers/string-input.js","./create-field":"/Users/justin/git/formatic/lib/components/create-field.js","./helpers/field":"/Users/justin/git/formatic/lib/components/helpers/field.js","./helpers/help":"/Users/justin/git/formatic/lib/components/helpers/help.js","./helpers/label":"/Users/justin/git/formatic/lib/components/helpers/label.js","./inputs/string":"/Users/justin/git/formatic/lib/components/inputs/string.js","./use-context":"/Users/justin/git/formatic/lib/components/use-context.js","./wrap-child-input":"/Users/justin/git/formatic/lib/components/wrap-child-input.js","./wrap-input":"/Users/justin/git/formatic/lib/components/wrap-input.js","./wrap-pure":"/Users/justin/git/formatic/lib/components/wrap-pure.js"}],"/Users/justin/git/formatic/lib/components/inputs/string.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

var StringInput = _react2['default'].createClass({
  displayName: 'StringInput',

  statics: {
    hasEvent: true
  },

  propTypes: {
    value: _react2['default'].PropTypes.string.isRequired,
    onChange: _react2['default'].PropTypes.func.isRequired
  },

  render: function render() {
    var _props = this.props;
    var value = _props.value;
    var onChange = _props.onChange;
    var onFocus = _props.onFocus;
    var onBlur = _props.onBlur;

    return _react2['default'].createElement('textarea', { value: value, onChange: onChange, onFocus: onFocus, onBlur: onBlur });
  }
});

exports['default'] = StringInput;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qdXN0aW4vZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2lucHV0cy9zdHJpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O3FCQUFrQixPQUFPOzs7O0FBRXpCLElBQU0sV0FBVyxHQUFHLG1CQUFNLFdBQVcsQ0FBQzs7O0FBRXBDLFNBQU8sRUFBRTtBQUNQLFlBQVEsRUFBRSxJQUFJO0dBQ2Y7O0FBRUQsV0FBUyxFQUFFO0FBQ1QsU0FBSyxFQUFFLG1CQUFNLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUN4QyxZQUFRLEVBQUUsbUJBQU0sU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0dBQzFDOztBQUVELFFBQU0sRUFBQSxrQkFBRztpQkFDb0MsSUFBSSxDQUFDLEtBQUs7UUFBOUMsS0FBSyxVQUFMLEtBQUs7UUFBRSxRQUFRLFVBQVIsUUFBUTtRQUFFLE9BQU8sVUFBUCxPQUFPO1FBQUUsTUFBTSxVQUFOLE1BQU07O0FBQ3ZDLFdBQU8sK0NBQVUsS0FBSyxFQUFFLEtBQUssQUFBQyxFQUFDLFFBQVEsRUFBRSxRQUFRLEFBQUMsRUFBQyxPQUFPLEVBQUUsT0FBTyxBQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sQUFBQyxHQUFFLENBQUM7R0FDeEY7Q0FDRixDQUFDLENBQUM7O3FCQUVZLFdBQVciLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmNvbnN0IFN0cmluZ0lucHV0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHN0YXRpY3M6IHtcbiAgICBoYXNFdmVudDogdHJ1ZVxuICB9LFxuXG4gIHByb3BUeXBlczoge1xuICAgIHZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgb25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWRcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge3ZhbHVlLCBvbkNoYW5nZSwgb25Gb2N1cywgb25CbHVyfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIDx0ZXh0YXJlYSB2YWx1ZT17dmFsdWV9IG9uQ2hhbmdlPXtvbkNoYW5nZX0gb25Gb2N1cz17b25Gb2N1c30gb25CbHVyPXtvbkJsdXJ9Lz47XG4gIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBTdHJpbmdJbnB1dDtcbiJdfQ==
},{}],"/Users/justin/git/formatic/lib/components/use-context.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

var _undash = require('../undash');

var _undash2 = _interopRequireDefault(_undash);

var useContext = function useContext(Component) {
  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var _ref$contextTypes = _ref.contextTypes;
  var contextTypes = _ref$contextTypes === undefined ? {} : _ref$contextTypes;
  var _ref$contextToProps = _ref.contextToProps;
  var contextToProps = _ref$contextToProps === undefined ? {} : _ref$contextToProps;

  var UseContext = _react2['default'].createClass({
    displayName: 'UseContext',

    contextTypes: contextTypes,

    propsFromContext: function propsFromContext() {
      var _this = this;

      var pairs = Object.keys(contextToProps).map(function (contextKey) {
        var propKey = contextToProps[contextKey];
        return [propKey, _this.context[contextKey]];
      });
      return _undash2['default'].object(pairs);
    },

    render: function render() {
      return _react2['default'].createElement(Component, _extends({}, this.props, this.propsFromContext()));
    }
  });

  return UseContext;
};

exports['default'] = useContext;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qdXN0aW4vZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL3VzZS1jb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O3FCQUFrQixPQUFPOzs7O3NCQUNYLFdBQVc7Ozs7QUFFekIsSUFBTSxVQUFVLEdBQUcsU0FBYixVQUFVLENBQUksU0FBUyxFQUFvRDttRUFBUCxFQUFFOzsrQkFBNUMsWUFBWTtNQUFaLFlBQVkscUNBQUcsRUFBRTtpQ0FBRSxjQUFjO01BQWQsY0FBYyx1Q0FBRyxFQUFFOztBQUVwRSxNQUFNLFVBQVUsR0FBRyxtQkFBTSxXQUFXLENBQUM7OztBQUVuQyxnQkFBWSxFQUFaLFlBQVk7O0FBRVosb0JBQWdCLEVBQUEsNEJBQUc7OztBQUNqQixVQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLFVBQVUsRUFBSTtBQUMxRCxZQUFNLE9BQU8sR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDM0MsZUFBTyxDQUFDLE9BQU8sRUFBRSxNQUFLLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO09BQzVDLENBQUMsQ0FBQztBQUNILGFBQU8sb0JBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3hCOztBQUVELFVBQU0sRUFBQSxrQkFBRztBQUNQLGFBQU8saUNBQUMsU0FBUyxlQUFLLElBQUksQ0FBQyxLQUFLLEVBQU0sSUFBSSxDQUFDLGdCQUFnQixFQUFFLEVBQUcsQ0FBQztLQUNsRTtHQUNGLENBQUMsQ0FBQzs7QUFFSCxTQUFPLFVBQVUsQ0FBQztDQUNuQixDQUFDOztxQkFFYSxVQUFVIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHUgZnJvbSAnLi4vdW5kYXNoJztcblxuY29uc3QgdXNlQ29udGV4dCA9IChDb21wb25lbnQsIHtjb250ZXh0VHlwZXMgPSB7fSwgY29udGV4dFRvUHJvcHMgPSB7fX0gPSB7fSkgPT4ge1xuXG4gIGNvbnN0IFVzZUNvbnRleHQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBjb250ZXh0VHlwZXMsXG5cbiAgICBwcm9wc0Zyb21Db250ZXh0KCkge1xuICAgICAgY29uc3QgcGFpcnMgPSBPYmplY3Qua2V5cyhjb250ZXh0VG9Qcm9wcykubWFwKGNvbnRleHRLZXkgPT4ge1xuICAgICAgICBjb25zdCBwcm9wS2V5ID0gY29udGV4dFRvUHJvcHNbY29udGV4dEtleV07XG4gICAgICAgIHJldHVybiBbcHJvcEtleSwgdGhpcy5jb250ZXh0W2NvbnRleHRLZXldXTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHUub2JqZWN0KHBhaXJzKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgcmV0dXJuIDxDb21wb25lbnQgey4uLnRoaXMucHJvcHN9IHsuLi50aGlzLnByb3BzRnJvbUNvbnRleHQoKX0vPjtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBVc2VDb250ZXh0O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgdXNlQ29udGV4dDtcbiJdfQ==
},{"../undash":"/Users/justin/git/formatic/lib/undash.js"}],"/Users/justin/git/formatic/lib/components/wrap-child-input.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

var _undash = require('../undash');

var _undash2 = _interopRequireDefault(_undash);

var wrapChildInput = function wrapChildInput(Input) {
  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var _ref$defaultValue = _ref.defaultValue;
  var defaultValue = _ref$defaultValue === undefined ? '' : _ref$defaultValue;

  var WrapChildInput = _react2['default'].createClass({
    displayName: 'WrapChildInput',

    mixins: [_react2['default'].PureRenderMixin],

    propTypes: {
      parentValue: _react2['default'].PropTypes.object.isRequired,
      childKey: _react2['default'].PropTypes.string.isRequired,
      onChange: _react2['default'].PropTypes.func.isRequired
    },

    childValue: function childValue() {
      var _props = this.props;
      var parentValue = _props.parentValue;
      var childKey = _props.childKey;

      var childValue = parentValue[childKey];
      if (_undash2['default'].isUndefined(childValue)) {
        return defaultValue;
      }
      return childValue;
    },

    onChange: function onChange(newValue) {
      var _props2 = this.props;
      var onChange = _props2.onChange;
      var childKey = _props2.childKey;

      onChange(newValue, {
        path: [childKey]
      });
    },

    render: function render() {
      var childValue = this.childValue;
      var onChange = this.onChange;

      var value = childValue();
      var _props3 = this.props;
      var parentKey = _props3.parentKey;
      var childKey = _props3.childKey;

      var props = _objectWithoutProperties(_props3, ['parentKey', 'childKey']);

      return _react2['default'].createElement(Input, _extends({}, props, { value: value, onChange: onChange }));
    }
  });

  return WrapChildInput;
};

exports['default'] = wrapChildInput;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qdXN0aW4vZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL3dyYXAtY2hpbGQtaW5wdXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztxQkFBa0IsT0FBTzs7OztzQkFDWCxXQUFXOzs7O0FBRXpCLElBQU0sY0FBYyxHQUFHLFNBQWpCLGNBQWMsQ0FBSSxLQUFLLEVBQStCO21FQUFQLEVBQUU7OytCQUF2QixZQUFZO01BQVosWUFBWSxxQ0FBRyxFQUFFOztBQUUvQyxNQUFNLGNBQWMsR0FBRyxtQkFBTSxXQUFXLENBQUM7OztBQUV2QyxVQUFNLEVBQUUsQ0FBQyxtQkFBTSxlQUFlLENBQUM7O0FBRS9CLGFBQVMsRUFBRTtBQUNULGlCQUFXLEVBQUUsbUJBQU0sU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQzlDLGNBQVEsRUFBRSxtQkFBTSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDM0MsY0FBUSxFQUFFLG1CQUFNLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtLQUMxQzs7QUFFRCxjQUFVLEVBQUEsc0JBQUc7bUJBQ3FCLElBQUksQ0FBQyxLQUFLO1VBQW5DLFdBQVcsVUFBWCxXQUFXO1VBQUUsUUFBUSxVQUFSLFFBQVE7O0FBQzVCLFVBQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN6QyxVQUFJLG9CQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUM3QixlQUFPLFlBQVksQ0FBQztPQUNyQjtBQUNELGFBQU8sVUFBVSxDQUFDO0tBQ25COztBQUVELFlBQVEsRUFBQSxrQkFBQyxRQUFRLEVBQUU7b0JBQ1ksSUFBSSxDQUFDLEtBQUs7VUFBaEMsUUFBUSxXQUFSLFFBQVE7VUFBRSxRQUFRLFdBQVIsUUFBUTs7QUFDekIsY0FBUSxDQUFDLFFBQVEsRUFBRTtBQUNqQixZQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUM7T0FDakIsQ0FBQyxDQUFDO0tBQ0o7O0FBRUQsVUFBTSxFQUFBLGtCQUFHO1VBQ0EsVUFBVSxHQUFjLElBQUksQ0FBNUIsVUFBVTtVQUFFLFFBQVEsR0FBSSxJQUFJLENBQWhCLFFBQVE7O0FBQzNCLFVBQU0sS0FBSyxHQUFHLFVBQVUsRUFBRSxDQUFDO29CQUNhLElBQUksQ0FBQyxLQUFLO1VBQTNDLFNBQVMsV0FBVCxTQUFTO1VBQUUsUUFBUSxXQUFSLFFBQVE7O1VBQUssS0FBSzs7QUFDcEMsYUFBTyxpQ0FBQyxLQUFLLGVBQUssS0FBSyxJQUFFLEtBQUssRUFBRSxLQUFLLEFBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxBQUFDLElBQUUsQ0FBQztLQUM5RDtHQUNGLENBQUMsQ0FBQzs7QUFFSCxTQUFPLGNBQWMsQ0FBQztDQUN2QixDQUFDOztxQkFFYSxjQUFjIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHUgZnJvbSAnLi4vdW5kYXNoJztcblxuY29uc3Qgd3JhcENoaWxkSW5wdXQgPSAoSW5wdXQsIHtkZWZhdWx0VmFsdWUgPSAnJ30gPSB7fSkgPT4ge1xuXG4gIGNvbnN0IFdyYXBDaGlsZElucHV0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgbWl4aW5zOiBbUmVhY3QuUHVyZVJlbmRlck1peGluXSxcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgcGFyZW50VmFsdWU6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgIGNoaWxkS2V5OiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICBvbkNoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZFxuICAgIH0sXG5cbiAgICBjaGlsZFZhbHVlKCkge1xuICAgICAgY29uc3Qge3BhcmVudFZhbHVlLCBjaGlsZEtleX0gPSB0aGlzLnByb3BzO1xuICAgICAgY29uc3QgY2hpbGRWYWx1ZSA9IHBhcmVudFZhbHVlW2NoaWxkS2V5XTtcbiAgICAgIGlmICh1LmlzVW5kZWZpbmVkKGNoaWxkVmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gY2hpbGRWYWx1ZTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2UobmV3VmFsdWUpIHtcbiAgICAgIGNvbnN0IHtvbkNoYW5nZSwgY2hpbGRLZXl9ID0gdGhpcy5wcm9wcztcbiAgICAgIG9uQ2hhbmdlKG5ld1ZhbHVlLCB7XG4gICAgICAgIHBhdGg6IFtjaGlsZEtleV1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXIoKSB7XG4gICAgICBjb25zdCB7Y2hpbGRWYWx1ZSwgb25DaGFuZ2V9ID0gdGhpcztcbiAgICAgIGNvbnN0IHZhbHVlID0gY2hpbGRWYWx1ZSgpO1xuICAgICAgY29uc3Qge3BhcmVudEtleSwgY2hpbGRLZXksIC4uLnByb3BzfSA9IHRoaXMucHJvcHM7XG4gICAgICByZXR1cm4gPElucHV0IHsuLi5wcm9wc30gdmFsdWU9e3ZhbHVlfSBvbkNoYW5nZT17b25DaGFuZ2V9Lz47XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gV3JhcENoaWxkSW5wdXQ7XG59O1xuXG5leHBvcnQgZGVmYXVsdCB3cmFwQ2hpbGRJbnB1dDtcbiJdfQ==
},{"../undash":"/Users/justin/git/formatic/lib/undash.js"}],"/Users/justin/git/formatic/lib/components/wrap-input.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = wrapInput;

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var React = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);
var u = require('../undash');

function wrapInput(InputComponent) {

  var WrapInput = React.createClass({
    displayName: 'WrapInput',

    mixins: [React.PureRenderMixin],

    getInitialState: function getInitialState() {
      return {
        isControlled: !u.isUndefined(this.props.value),
        value: u.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value
      };
    },

    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
      if (this.state.isControlled) {
        if (!u.isUndefined(newProps.value)) {
          this.setState({
            value: newProps.value
          });
        }
      }
    },

    onChange: function onChange(newValue, info) {

      if (InputComponent.hasEvent || this.props.hasEvent) {
        var _event = newValue;
        newValue = _event.target.value;
      }

      if (!this.state.isControlled) {
        this.setState({
          value: newValue
        });
      }
      if (!this.props.onChange) {
        return;
      }
      this.props.onChange(newValue, info);
    },

    render: function render() {
      var _props = this.props;
      var hasEvent = _props.hasEvent;

      var props = _objectWithoutProperties(_props, ['hasEvent']);

      return React.createElement(InputComponent, _extends({}, props, {
        value: this.state.value,
        onChange: this.onChange
      }));
    }
  });

  return WrapInput;
}

module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qdXN0aW4vZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL3dyYXAtaW5wdXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O3FCQUd3QixTQUFTOzs7O0FBSGpDLElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMvQixJQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7O0FBRWhCLFNBQVMsU0FBUyxDQUFDLGNBQWMsRUFBRTs7QUFFaEQsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBRWxDLFVBQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7O0FBRS9CLG1CQUFlLEVBQUEsMkJBQUc7QUFDaEIsYUFBTztBQUNMLG9CQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQzlDLGFBQUssRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLO09BQ3BGLENBQUM7S0FDSDs7QUFFRCw2QkFBeUIsRUFBQyxtQ0FBQyxRQUFRLEVBQUU7QUFDbkMsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRTtBQUMzQixZQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDbEMsY0FBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLGlCQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUs7V0FDdEIsQ0FBQyxDQUFDO1NBQ0o7T0FDRjtLQUNGOztBQUVELFlBQVEsRUFBQyxrQkFBQyxRQUFRLEVBQUUsSUFBSSxFQUFFOztBQUV4QixVQUFJLGNBQWMsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7QUFDbEQsWUFBTSxNQUFLLEdBQUcsUUFBUSxDQUFDO0FBQ3ZCLGdCQUFRLEdBQUcsTUFBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7T0FDL0I7O0FBRUQsVUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFO0FBQzVCLFlBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixlQUFLLEVBQUUsUUFBUTtTQUNoQixDQUFDLENBQUM7T0FDSjtBQUNELFVBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUN4QixlQUFPO09BQ1I7QUFDRCxVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDckM7O0FBRUQsVUFBTSxFQUFBLGtCQUFHO21CQUNzQixJQUFJLENBQUMsS0FBSztVQUFoQyxRQUFRLFVBQVIsUUFBUTs7VUFBSyxLQUFLOztBQUV6QixhQUFPLG9CQUFDLGNBQWMsZUFBSyxLQUFLO0FBQzlCLGFBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQUFBQztBQUN4QixnQkFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEFBQUM7U0FDeEIsQ0FBQztLQUNKO0dBQ0YsQ0FBQyxDQUFDOztBQUVILFNBQU8sU0FBUyxDQUFDO0NBQ2xCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5jb25zdCB1ID0gcmVxdWlyZSgnLi4vdW5kYXNoJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHdyYXBJbnB1dChJbnB1dENvbXBvbmVudCkge1xuXG4gIGNvbnN0IFdyYXBJbnB1dCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIG1peGluczogW1JlYWN0LlB1cmVSZW5kZXJNaXhpbl0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpc0NvbnRyb2xsZWQ6ICF1LmlzVW5kZWZpbmVkKHRoaXMucHJvcHMudmFsdWUpLFxuICAgICAgICB2YWx1ZTogdS5pc1VuZGVmaW5lZCh0aGlzLnByb3BzLnZhbHVlKSA/IHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlIDogdGhpcy5wcm9wcy52YWx1ZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyAobmV3UHJvcHMpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLmlzQ29udHJvbGxlZCkge1xuICAgICAgICBpZiAoIXUuaXNVbmRlZmluZWQobmV3UHJvcHMudmFsdWUpKSB7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB2YWx1ZTogbmV3UHJvcHMudmFsdWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkNoYW5nZSAobmV3VmFsdWUsIGluZm8pIHtcblxuICAgICAgaWYgKElucHV0Q29tcG9uZW50Lmhhc0V2ZW50IHx8IHRoaXMucHJvcHMuaGFzRXZlbnQpIHtcbiAgICAgICAgY29uc3QgZXZlbnQgPSBuZXdWYWx1ZTtcbiAgICAgICAgbmV3VmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgdmFsdWU6IG5ld1ZhbHVlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUsIGluZm8pO1xuICAgIH0sXG5cbiAgICByZW5kZXIoKSB7XG4gICAgICBjb25zdCB7aGFzRXZlbnQsIC4uLnByb3BzfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgIHJldHVybiA8SW5wdXRDb21wb25lbnQgey4uLnByb3BzfVxuICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS52YWx1ZX1cbiAgICAgICAgb25DaGFuZ2U9e3RoaXMub25DaGFuZ2V9XG4gICAgICAvPjtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBXcmFwSW5wdXQ7XG59XG4iXX0=
},{"../undash":"/Users/justin/git/formatic/lib/undash.js"}],"/Users/justin/git/formatic/lib/components/wrap-pure.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

var wrapPure = function wrapPure(Component) {

  var WrapPure = _react2['default'].createClass({
    displayName: 'WrapPure',

    mixins: [_react2['default'].PureRenderMixin],

    render: function render() {
      return _react2['default'].createElement(Component, this.props);
    }
  });

  return WrapPure;
};

exports['default'] = wrapPure;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qdXN0aW4vZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL3dyYXAtcHVyZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7cUJBQWtCLE9BQU87Ozs7QUFFekIsSUFBTSxRQUFRLEdBQUcsU0FBWCxRQUFRLENBQUksU0FBUyxFQUFLOztBQUU5QixNQUFNLFFBQVEsR0FBRyxtQkFBTSxXQUFXLENBQUM7OztBQUVqQyxVQUFNLEVBQUUsQ0FBQyxtQkFBTSxlQUFlLENBQUM7O0FBRS9CLFVBQU0sRUFBQSxrQkFBRztBQUNQLGFBQU8saUNBQUMsU0FBUyxFQUFLLElBQUksQ0FBQyxLQUFLLENBQUcsQ0FBQztLQUNyQztHQUNGLENBQUMsQ0FBQzs7QUFFSCxTQUFPLFFBQVEsQ0FBQztDQUNqQixDQUFDOztxQkFFYSxRQUFRIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5jb25zdCB3cmFwUHVyZSA9IChDb21wb25lbnQpID0+IHtcblxuICBjb25zdCBXcmFwUHVyZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIG1peGluczogW1JlYWN0LlB1cmVSZW5kZXJNaXhpbl0sXG5cbiAgICByZW5kZXIoKSB7XG4gICAgICByZXR1cm4gPENvbXBvbmVudCB7Li4udGhpcy5wcm9wc30vPjtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBXcmFwUHVyZTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHdyYXBQdXJlO1xuIl19
},{}],"/Users/justin/git/formatic/lib/formatic.js":[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);
var _ = require('./undash');
var Components = require('./components');
//const ComponentContainer = require('./component-container');

//ComponentContainer.setComponents(Components);

module.exports = React.createClass({
  displayName: 'exports',

  statics: _.extend({
    //wrap: require('./components/wrap-component')
    //field: require('./components/wrap-field'),
    //helper: require('./components/wrap-helper')
    //ComponentContainer: require('./components/containers/component')
    components: Components
  }, Components),

  component: function component(name) {
    if (this.props.component) {
      return this.props.component(name);
    }
    var componentClass = this.props.components && this.props.components[name];
    if (componentClass) {
      return componentClass;
    }
    return Components[name] || Components.Unknown;
  },

  render: function render() {
    if (this.props.children && !_.isArray(this.props.children)) {
      var props = _.extend({}, this.props, { component: this.component });
      return React.cloneElement(this.props.children, props);
    }
    throw new Error('You must provide exactly one child to the Formatic component.');
  }

});

// // # formatic
//
// /*
// The root formatic component.
//
// The root formatic component is actually two components. The main component is
// a controlled component where you must pass the value in with each render. This
// is actually wrapped in another component which allows you to use formatic as
// an uncontrolled component where it retains the state of the value. The wrapper
// is what is actually exported.
// */
//
// 'use strict';
//
// var React = require('react/addons');
// var _ = require('./undash');
//
// var utils = require('./utils');
//
// var defaultConfigPlugin = require('./default-config');
//
// var createConfig = function (...args) {
//   var plugins = [defaultConfigPlugin].concat(args);
//
//   return plugins.reduce(function (config, plugin) {
//     if (_.isFunction(plugin)) {
//       var extensions = plugin(config);
//       if (extensions) {
//         _.extend(config, extensions);
//       }
//     } else {
//       _.extend(config, plugin);
//     }
//
//     return config;
//   }, {});
// };
//
// var defaultConfig = createConfig();
//
// // The main formatic component that renders the form.
// var FormaticControlledClass = React.createClass({
//
//   displayName: 'FormaticControlled',
//
//   // Respond to any value changes.
//   onChange: function (newValue, info) {
//     if (!this.props.onChange) {
//       return;
//     }
//     info = _.extend({}, info);
//     info.path = this.props.config.fieldValuePath(info.field);
//     this.props.onChange(newValue, info);
//   },
//
//   // Respond to any actions other than value changes. (For example, focus and
//   // blur.)
//   onAction: function (info) {
//     if (!this.props.onAction) {
//       return;
//     }
//     info = _.extend({}, info);
//     info.path = this.props.config.fieldValuePath(info.field);
//     this.props.onAction(info);
//   },
//
//   // Render the root component by delegating to the config.
//   render: function () {
//
//     var config = this.props.config;
//
//     return config.renderFormaticComponent(this);
//   }
// });
//
// var FormaticControlled = React.createFactory(FormaticControlledClass);
//
// // A wrapper component that is actually exported and can allow formatic to be
// // used in an "uncontrolled" manner. (See uncontrolled components in the React
// // documentation for an explanation of the difference.)
// module.exports = React.createClass({
//
//   // Export some stuff as statics.
//   statics: {
//     createConfig: createConfig,
//     availableMixins: {
//       clickOutside: require('./mixins/click-outside.js'),
//       field: require('./mixins/field.js'),
//       helper: require('./mixins/helper.js'),
//       resize: require('./mixins/resize.js'),
//       scroll: require('./mixins/scroll.js'),
//       undoStack: require('./mixins/undo-stack.js')
//     },
//     plugins: {
//       bootstrap: require('./plugins/bootstrap'),
//       meta: require('./plugins/meta'),
//       reference: require('./plugins/reference'),
//       elementClasses: require('./plugins/element-classes')
//     },
//     utils: utils
//   },
//
//   displayName: 'Formatic',
//
//   // If we got a value, treat this component as controlled. Either way, retain
//   // the value in the state.
//   getInitialState: function () {
//     return {
//       isControlled: !_.isUndefined(this.props.value),
//       value: _.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value
//     };
//   },
//
//   // If this is a controlled component, change our state to reflect the new
//   // value. For uncontrolled components, ignore any value changes.
//   componentWillReceiveProps: function (newProps) {
//     if (this.state.isControlled) {
//       if (!_.isUndefined(newProps.value)) {
//         this.setState({
//           value: newProps.value
//         });
//       }
//     }
//   },
//
//   // If this is an uncontrolled component, set our state to reflect the new
//   // value. Either way, call the onChange callback.
//   onChange: function (newValue, info) {
//     if (!this.state.isControlled) {
//       this.setState({
//         value: newValue
//       });
//     }
//     if (!this.props.onChange) {
//       return;
//     }
//     this.props.onChange(newValue, info);
//   },
//
//   // Any actions should be sent to the generic onAction callback but also split
//   // into discreet callbacks per action.
//   onAction: function (info) {
//     if (this.props.onAction) {
//       this.props.onAction(info);
//     }
//     var action = utils.dashToPascal(info.action);
//     if (this.props['on' + action]) {
//       this.props['on' + action](info);
//     }
//   },
//
//   // Render the wrapper component (by just delegating to the main component).
//   render: function () {
//
//     var config = this.props.config || defaultConfig;
//     var value = this.state.value;
//
//     if (this.state.isControlled) {
//       if (!this.props.onChange) {
//         console.log('You should supply an onChange handler if you supply a value.');
//       }
//     }
//
//     var props = {
//       config: config,
//       // Allow field templates to be passed in as `field` or `fields`. After this, stop
//       // calling them fields.
//       fieldTemplate: this.props.field,
//       fieldTemplates: this.props.fields,
//       value: value,
//       onChange: this.onChange,
//       onAction: this.onAction
//     };
//
//     _.each(this.props, function (propValue, key) {
//       if (!(key in props)) {
//         props[key] = propValue;
//       }
//     });
//
//     return FormaticControlled(props);
//   }
//
// });

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qdXN0aW4vZ2l0L2Zvcm1hdGljL2xpYi9mb3JtYXRpYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0IsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzlCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQzs7Ozs7QUFLM0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFFakMsU0FBTyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7Ozs7O0FBS2hCLGNBQVUsRUFBRSxVQUFVO0dBQ3ZCLEVBQ0MsVUFBVSxDQUNYOztBQUVELFdBQVMsRUFBQSxtQkFBQyxJQUFJLEVBQUU7QUFDZCxRQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFO0FBQ3hCLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDbkM7QUFDRCxRQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1RSxRQUFJLGNBQWMsRUFBRTtBQUNsQixhQUFPLGNBQWMsQ0FBQztLQUN2QjtBQUNELFdBQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUM7R0FDL0M7O0FBRUQsUUFBTSxFQUFBLGtCQUFHO0FBQ1AsUUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUMxRCxVQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDO0FBQ3BFLGFBQU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUN2RDtBQUNELFVBQU0sSUFBSSxLQUFLLENBQUMsK0RBQStELENBQUMsQ0FBQztHQUNsRjs7Q0FFRixDQUFDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IF8gPSByZXF1aXJlKCcuL3VuZGFzaCcpO1xuY29uc3QgQ29tcG9uZW50cyA9IHJlcXVpcmUoJy4vY29tcG9uZW50cycpO1xuLy9jb25zdCBDb21wb25lbnRDb250YWluZXIgPSByZXF1aXJlKCcuL2NvbXBvbmVudC1jb250YWluZXInKTtcblxuLy9Db21wb25lbnRDb250YWluZXIuc2V0Q29tcG9uZW50cyhDb21wb25lbnRzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgc3RhdGljczogXy5leHRlbmQoe1xuICAgIC8vd3JhcDogcmVxdWlyZSgnLi9jb21wb25lbnRzL3dyYXAtY29tcG9uZW50JylcbiAgICAvL2ZpZWxkOiByZXF1aXJlKCcuL2NvbXBvbmVudHMvd3JhcC1maWVsZCcpLFxuICAgIC8vaGVscGVyOiByZXF1aXJlKCcuL2NvbXBvbmVudHMvd3JhcC1oZWxwZXInKVxuICAgIC8vQ29tcG9uZW50Q29udGFpbmVyOiByZXF1aXJlKCcuL2NvbXBvbmVudHMvY29udGFpbmVycy9jb21wb25lbnQnKVxuICAgIGNvbXBvbmVudHM6IENvbXBvbmVudHNcbiAgfSxcbiAgICBDb21wb25lbnRzXG4gICksXG5cbiAgY29tcG9uZW50KG5hbWUpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5jb21wb25lbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLmNvbXBvbmVudChuYW1lKTtcbiAgICB9XG4gICAgY29uc3QgY29tcG9uZW50Q2xhc3MgPSB0aGlzLnByb3BzLmNvbXBvbmVudHMgJiYgdGhpcy5wcm9wcy5jb21wb25lbnRzW25hbWVdO1xuICAgIGlmIChjb21wb25lbnRDbGFzcykge1xuICAgICAgcmV0dXJuIGNvbXBvbmVudENsYXNzO1xuICAgIH1cbiAgICByZXR1cm4gQ29tcG9uZW50c1tuYW1lXSB8fCBDb21wb25lbnRzLlVua25vd247XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIGlmICh0aGlzLnByb3BzLmNoaWxkcmVuICYmICFfLmlzQXJyYXkodGhpcy5wcm9wcy5jaGlsZHJlbikpIHtcbiAgICAgIGNvbnN0IHByb3BzID0gXy5leHRlbmQoe30sIHRoaXMucHJvcHMsIHtjb21wb25lbnQ6IHRoaXMuY29tcG9uZW50fSk7XG4gICAgICByZXR1cm4gUmVhY3QuY2xvbmVFbGVtZW50KHRoaXMucHJvcHMuY2hpbGRyZW4sIHByb3BzKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbXVzdCBwcm92aWRlIGV4YWN0bHkgb25lIGNoaWxkIHRvIHRoZSBGb3JtYXRpYyBjb21wb25lbnQuJyk7XG4gIH1cblxufSk7XG5cblxuLy8gLy8gIyBmb3JtYXRpY1xuLy9cbi8vIC8qXG4vLyBUaGUgcm9vdCBmb3JtYXRpYyBjb21wb25lbnQuXG4vL1xuLy8gVGhlIHJvb3QgZm9ybWF0aWMgY29tcG9uZW50IGlzIGFjdHVhbGx5IHR3byBjb21wb25lbnRzLiBUaGUgbWFpbiBjb21wb25lbnQgaXNcbi8vIGEgY29udHJvbGxlZCBjb21wb25lbnQgd2hlcmUgeW91IG11c3QgcGFzcyB0aGUgdmFsdWUgaW4gd2l0aCBlYWNoIHJlbmRlci4gVGhpc1xuLy8gaXMgYWN0dWFsbHkgd3JhcHBlZCBpbiBhbm90aGVyIGNvbXBvbmVudCB3aGljaCBhbGxvd3MgeW91IHRvIHVzZSBmb3JtYXRpYyBhc1xuLy8gYW4gdW5jb250cm9sbGVkIGNvbXBvbmVudCB3aGVyZSBpdCByZXRhaW5zIHRoZSBzdGF0ZSBvZiB0aGUgdmFsdWUuIFRoZSB3cmFwcGVyXG4vLyBpcyB3aGF0IGlzIGFjdHVhbGx5IGV4cG9ydGVkLlxuLy8gKi9cbi8vXG4vLyAndXNlIHN0cmljdCc7XG4vL1xuLy8gdmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG4vLyB2YXIgXyA9IHJlcXVpcmUoJy4vdW5kYXNoJyk7XG4vL1xuLy8gdmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuLy9cbi8vIHZhciBkZWZhdWx0Q29uZmlnUGx1Z2luID0gcmVxdWlyZSgnLi9kZWZhdWx0LWNvbmZpZycpO1xuLy9cbi8vIHZhciBjcmVhdGVDb25maWcgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuLy8gICB2YXIgcGx1Z2lucyA9IFtkZWZhdWx0Q29uZmlnUGx1Z2luXS5jb25jYXQoYXJncyk7XG4vL1xuLy8gICByZXR1cm4gcGx1Z2lucy5yZWR1Y2UoZnVuY3Rpb24gKGNvbmZpZywgcGx1Z2luKSB7XG4vLyAgICAgaWYgKF8uaXNGdW5jdGlvbihwbHVnaW4pKSB7XG4vLyAgICAgICB2YXIgZXh0ZW5zaW9ucyA9IHBsdWdpbihjb25maWcpO1xuLy8gICAgICAgaWYgKGV4dGVuc2lvbnMpIHtcbi8vICAgICAgICAgXy5leHRlbmQoY29uZmlnLCBleHRlbnNpb25zKTtcbi8vICAgICAgIH1cbi8vICAgICB9IGVsc2Uge1xuLy8gICAgICAgXy5leHRlbmQoY29uZmlnLCBwbHVnaW4pO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgcmV0dXJuIGNvbmZpZztcbi8vICAgfSwge30pO1xuLy8gfTtcbi8vXG4vLyB2YXIgZGVmYXVsdENvbmZpZyA9IGNyZWF0ZUNvbmZpZygpO1xuLy9cbi8vIC8vIFRoZSBtYWluIGZvcm1hdGljIGNvbXBvbmVudCB0aGF0IHJlbmRlcnMgdGhlIGZvcm0uXG4vLyB2YXIgRm9ybWF0aWNDb250cm9sbGVkQ2xhc3MgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4vL1xuLy8gICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljQ29udHJvbGxlZCcsXG4vL1xuLy8gICAvLyBSZXNwb25kIHRvIGFueSB2YWx1ZSBjaGFuZ2VzLlxuLy8gICBvbkNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBpbmZvKSB7XG4vLyAgICAgaWYgKCF0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4vLyAgICAgICByZXR1cm47XG4vLyAgICAgfVxuLy8gICAgIGluZm8gPSBfLmV4dGVuZCh7fSwgaW5mbyk7XG4vLyAgICAgaW5mby5wYXRoID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRWYWx1ZVBhdGgoaW5mby5maWVsZCk7XG4vLyAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBSZXNwb25kIHRvIGFueSBhY3Rpb25zIG90aGVyIHRoYW4gdmFsdWUgY2hhbmdlcy4gKEZvciBleGFtcGxlLCBmb2N1cyBhbmRcbi8vICAgLy8gYmx1ci4pXG4vLyAgIG9uQWN0aW9uOiBmdW5jdGlvbiAoaW5mbykge1xuLy8gICAgIGlmICghdGhpcy5wcm9wcy5vbkFjdGlvbikge1xuLy8gICAgICAgcmV0dXJuO1xuLy8gICAgIH1cbi8vICAgICBpbmZvID0gXy5leHRlbmQoe30sIGluZm8pO1xuLy8gICAgIGluZm8ucGF0aCA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkVmFsdWVQYXRoKGluZm8uZmllbGQpO1xuLy8gICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBSZW5kZXIgdGhlIHJvb3QgY29tcG9uZW50IGJ5IGRlbGVnYXRpbmcgdG8gdGhlIGNvbmZpZy5cbi8vICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4vL1xuLy8gICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbi8vXG4vLyAgICAgcmV0dXJuIGNvbmZpZy5yZW5kZXJGb3JtYXRpY0NvbXBvbmVudCh0aGlzKTtcbi8vICAgfVxuLy8gfSk7XG4vL1xuLy8gdmFyIEZvcm1hdGljQ29udHJvbGxlZCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoRm9ybWF0aWNDb250cm9sbGVkQ2xhc3MpO1xuLy9cbi8vIC8vIEEgd3JhcHBlciBjb21wb25lbnQgdGhhdCBpcyBhY3R1YWxseSBleHBvcnRlZCBhbmQgY2FuIGFsbG93IGZvcm1hdGljIHRvIGJlXG4vLyAvLyB1c2VkIGluIGFuIFwidW5jb250cm9sbGVkXCIgbWFubmVyLiAoU2VlIHVuY29udHJvbGxlZCBjb21wb25lbnRzIGluIHRoZSBSZWFjdFxuLy8gLy8gZG9jdW1lbnRhdGlvbiBmb3IgYW4gZXhwbGFuYXRpb24gb2YgdGhlIGRpZmZlcmVuY2UuKVxuLy8gbW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4vL1xuLy8gICAvLyBFeHBvcnQgc29tZSBzdHVmZiBhcyBzdGF0aWNzLlxuLy8gICBzdGF0aWNzOiB7XG4vLyAgICAgY3JlYXRlQ29uZmlnOiBjcmVhdGVDb25maWcsXG4vLyAgICAgYXZhaWxhYmxlTWl4aW5zOiB7XG4vLyAgICAgICBjbGlja091dHNpZGU6IHJlcXVpcmUoJy4vbWl4aW5zL2NsaWNrLW91dHNpZGUuanMnKSxcbi8vICAgICAgIGZpZWxkOiByZXF1aXJlKCcuL21peGlucy9maWVsZC5qcycpLFxuLy8gICAgICAgaGVscGVyOiByZXF1aXJlKCcuL21peGlucy9oZWxwZXIuanMnKSxcbi8vICAgICAgIHJlc2l6ZTogcmVxdWlyZSgnLi9taXhpbnMvcmVzaXplLmpzJyksXG4vLyAgICAgICBzY3JvbGw6IHJlcXVpcmUoJy4vbWl4aW5zL3Njcm9sbC5qcycpLFxuLy8gICAgICAgdW5kb1N0YWNrOiByZXF1aXJlKCcuL21peGlucy91bmRvLXN0YWNrLmpzJylcbi8vICAgICB9LFxuLy8gICAgIHBsdWdpbnM6IHtcbi8vICAgICAgIGJvb3RzdHJhcDogcmVxdWlyZSgnLi9wbHVnaW5zL2Jvb3RzdHJhcCcpLFxuLy8gICAgICAgbWV0YTogcmVxdWlyZSgnLi9wbHVnaW5zL21ldGEnKSxcbi8vICAgICAgIHJlZmVyZW5jZTogcmVxdWlyZSgnLi9wbHVnaW5zL3JlZmVyZW5jZScpLFxuLy8gICAgICAgZWxlbWVudENsYXNzZXM6IHJlcXVpcmUoJy4vcGx1Z2lucy9lbGVtZW50LWNsYXNzZXMnKVxuLy8gICAgIH0sXG4vLyAgICAgdXRpbHM6IHV0aWxzXG4vLyAgIH0sXG4vL1xuLy8gICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljJyxcbi8vXG4vLyAgIC8vIElmIHdlIGdvdCBhIHZhbHVlLCB0cmVhdCB0aGlzIGNvbXBvbmVudCBhcyBjb250cm9sbGVkLiBFaXRoZXIgd2F5LCByZXRhaW5cbi8vICAgLy8gdGhlIHZhbHVlIGluIHRoZSBzdGF0ZS5cbi8vICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4vLyAgICAgcmV0dXJuIHtcbi8vICAgICAgIGlzQ29udHJvbGxlZDogIV8uaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSksXG4vLyAgICAgICB2YWx1ZTogXy5pc1VuZGVmaW5lZCh0aGlzLnByb3BzLnZhbHVlKSA/IHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlIDogdGhpcy5wcm9wcy52YWx1ZVxuLy8gICAgIH07XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBJZiB0aGlzIGlzIGEgY29udHJvbGxlZCBjb21wb25lbnQsIGNoYW5nZSBvdXIgc3RhdGUgdG8gcmVmbGVjdCB0aGUgbmV3XG4vLyAgIC8vIHZhbHVlLiBGb3IgdW5jb250cm9sbGVkIGNvbXBvbmVudHMsIGlnbm9yZSBhbnkgdmFsdWUgY2hhbmdlcy5cbi8vICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG4vLyAgICAgaWYgKHRoaXMuc3RhdGUuaXNDb250cm9sbGVkKSB7XG4vLyAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQobmV3UHJvcHMudmFsdWUpKSB7XG4vLyAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuLy8gICAgICAgICAgIHZhbHVlOiBuZXdQcm9wcy52YWx1ZVxuLy8gICAgICAgICB9KTtcbi8vICAgICAgIH1cbi8vICAgICB9XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBJZiB0aGlzIGlzIGFuIHVuY29udHJvbGxlZCBjb21wb25lbnQsIHNldCBvdXIgc3RhdGUgdG8gcmVmbGVjdCB0aGUgbmV3XG4vLyAgIC8vIHZhbHVlLiBFaXRoZXIgd2F5LCBjYWxsIHRoZSBvbkNoYW5nZSBjYWxsYmFjay5cbi8vICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuLy8gICAgIGlmICghdGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbi8vICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuLy8gICAgICAgICB2YWx1ZTogbmV3VmFsdWVcbi8vICAgICAgIH0pO1xuLy8gICAgIH1cbi8vICAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbi8vICAgICAgIHJldHVybjtcbi8vICAgICB9XG4vLyAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBBbnkgYWN0aW9ucyBzaG91bGQgYmUgc2VudCB0byB0aGUgZ2VuZXJpYyBvbkFjdGlvbiBjYWxsYmFjayBidXQgYWxzbyBzcGxpdFxuLy8gICAvLyBpbnRvIGRpc2NyZWV0IGNhbGxiYWNrcyBwZXIgYWN0aW9uLlxuLy8gICBvbkFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbi8vICAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuLy8gICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbi8vICAgICB9XG4vLyAgICAgdmFyIGFjdGlvbiA9IHV0aWxzLmRhc2hUb1Bhc2NhbChpbmZvLmFjdGlvbik7XG4vLyAgICAgaWYgKHRoaXMucHJvcHNbJ29uJyArIGFjdGlvbl0pIHtcbi8vICAgICAgIHRoaXMucHJvcHNbJ29uJyArIGFjdGlvbl0oaW5mbyk7XG4vLyAgICAgfVxuLy8gICB9LFxuLy9cbi8vICAgLy8gUmVuZGVyIHRoZSB3cmFwcGVyIGNvbXBvbmVudCAoYnkganVzdCBkZWxlZ2F0aW5nIHRvIHRoZSBtYWluIGNvbXBvbmVudCkuXG4vLyAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuLy9cbi8vICAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWcgfHwgZGVmYXVsdENvbmZpZztcbi8vICAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuLy9cbi8vICAgICBpZiAodGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbi8vICAgICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuLy8gICAgICAgICBjb25zb2xlLmxvZygnWW91IHNob3VsZCBzdXBwbHkgYW4gb25DaGFuZ2UgaGFuZGxlciBpZiB5b3Ugc3VwcGx5IGEgdmFsdWUuJyk7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy9cbi8vICAgICB2YXIgcHJvcHMgPSB7XG4vLyAgICAgICBjb25maWc6IGNvbmZpZyxcbi8vICAgICAgIC8vIEFsbG93IGZpZWxkIHRlbXBsYXRlcyB0byBiZSBwYXNzZWQgaW4gYXMgYGZpZWxkYCBvciBgZmllbGRzYC4gQWZ0ZXIgdGhpcywgc3RvcFxuLy8gICAgICAgLy8gY2FsbGluZyB0aGVtIGZpZWxkcy5cbi8vICAgICAgIGZpZWxkVGVtcGxhdGU6IHRoaXMucHJvcHMuZmllbGQsXG4vLyAgICAgICBmaWVsZFRlbXBsYXRlczogdGhpcy5wcm9wcy5maWVsZHMsXG4vLyAgICAgICB2YWx1ZTogdmFsdWUsXG4vLyAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbi8vICAgICAgIG9uQWN0aW9uOiB0aGlzLm9uQWN0aW9uXG4vLyAgICAgfTtcbi8vXG4vLyAgICAgXy5lYWNoKHRoaXMucHJvcHMsIGZ1bmN0aW9uIChwcm9wVmFsdWUsIGtleSkge1xuLy8gICAgICAgaWYgKCEoa2V5IGluIHByb3BzKSkge1xuLy8gICAgICAgICBwcm9wc1trZXldID0gcHJvcFZhbHVlO1xuLy8gICAgICAgfVxuLy8gICAgIH0pO1xuLy9cbi8vICAgICByZXR1cm4gRm9ybWF0aWNDb250cm9sbGVkKHByb3BzKTtcbi8vICAgfVxuLy9cbi8vIH0pO1xuIl19
},{"./components":"/Users/justin/git/formatic/lib/components/index.js","./undash":"/Users/justin/git/formatic/lib/undash.js"}],"/Users/justin/git/formatic/lib/react-utils.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

var _undash = require('./undash');

var _undash2 = _interopRequireDefault(_undash);

var cloneChild = function cloneChild(children, props) {

  if (_undash2['default'].isFunction(children)) {
    return children(props);
  }

  if (_undash2['default'].isNull(children) || _undash2['default'].isUndefined(children)) {
    if (props.onRender) {
      var onRender = props.onRender;

      var otherProps = _objectWithoutProperties(props, ['onRender']);

      return onRender(otherProps);
    }

    return null;
  }

  var child = _react2['default'].Children.only(children);

  return _react2['default'].cloneElement(child, props);
};

exports.cloneChild = cloneChild;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qdXN0aW4vZ2l0L2Zvcm1hdGljL2xpYi9yZWFjdC11dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztxQkFBa0IsT0FBTzs7OztzQkFDWCxVQUFVOzs7O0FBRXhCLElBQU0sVUFBVSxHQUFHLFNBQWIsVUFBVSxDQUFJLFFBQVEsRUFBRSxLQUFLLEVBQUs7O0FBRXRDLE1BQUksb0JBQUUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQzFCLFdBQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQ3hCOztBQUVELE1BQUksb0JBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLG9CQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUNqRCxRQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUU7VUFDWCxRQUFRLEdBQW1CLEtBQUssQ0FBaEMsUUFBUTs7VUFBSyxVQUFVLDRCQUFJLEtBQUs7O0FBQ3ZDLGFBQU8sUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQzdCOztBQUVELFdBQU8sSUFBSSxDQUFDO0dBQ2I7O0FBRUQsTUFBTSxLQUFLLEdBQUcsbUJBQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFNUMsU0FBTyxtQkFBTSxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQ3pDLENBQUM7O1FBR0EsVUFBVSxHQUFWLFVBQVUiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgdSBmcm9tICcuL3VuZGFzaCc7XG5cbmNvbnN0IGNsb25lQ2hpbGQgPSAoY2hpbGRyZW4sIHByb3BzKSA9PiB7XG5cbiAgaWYgKHUuaXNGdW5jdGlvbihjaGlsZHJlbikpIHtcbiAgICByZXR1cm4gY2hpbGRyZW4ocHJvcHMpO1xuICB9XG5cbiAgaWYgKHUuaXNOdWxsKGNoaWxkcmVuKSB8fCB1LmlzVW5kZWZpbmVkKGNoaWxkcmVuKSkge1xuICAgIGlmIChwcm9wcy5vblJlbmRlcikge1xuICAgICAgY29uc3Qge29uUmVuZGVyLCAuLi5vdGhlclByb3BzfSA9IHByb3BzO1xuICAgICAgcmV0dXJuIG9uUmVuZGVyKG90aGVyUHJvcHMpO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgY2hpbGQgPSBSZWFjdC5DaGlsZHJlbi5vbmx5KGNoaWxkcmVuKTtcblxuICByZXR1cm4gUmVhY3QuY2xvbmVFbGVtZW50KGNoaWxkLCBwcm9wcyk7XG59O1xuXG5leHBvcnQge1xuICBjbG9uZUNoaWxkXG59O1xuIl19
},{"./undash":"/Users/justin/git/formatic/lib/undash.js"}],"/Users/justin/git/formatic/lib/undash.js":[function(require,module,exports){
'use strict';

var _ = {};

_.assign = _.extend = require('object-assign');
_.isEqual = require('deep-equal');

// These are not necessarily complete implementations. They're just enough for
// what's used in formatic.

_.flatten = function (arrays) {
  return [].concat.apply([], arrays);
};

_.isString = function (value) {
  return typeof value === 'string';
};
_.isUndefined = function (value) {
  return typeof value === 'undefined';
};
_.isObject = function (value) {
  return typeof value === 'object';
};
_.isArray = function (value) {
  return Object.prototype.toString.call(value) === '[object Array]';
};
_.isNumber = function (value) {
  return typeof value === 'number';
};
_.isBoolean = function (value) {
  return typeof value === 'boolean';
};
_.isNull = function (value) {
  return value === null;
};
_.isFunction = function (value) {
  return typeof value === 'function';
};

_.clone = function (value) {
  if (!_.isObject(value)) {
    return value;
  }
  return _.isArray(value) ? value.slice() : _.assign({}, value);
};

_.find = function (items, testFn) {
  for (var i = 0; i < items.length; i++) {
    if (testFn(items[i])) {
      return items[i];
    }
  }
  return void 0;
};

_.every = function (items, testFn) {
  for (var i = 0; i < items.length; i++) {
    if (!testFn(items[i])) {
      return false;
    }
  }
  return true;
};

_.each = function (obj, iterateFn) {
  Object.keys(obj).forEach(function (key) {
    iterateFn(obj[key], key);
  });
};

_.object = function (array) {
  var obj = {};

  array.forEach(function (pair) {
    obj[pair[0]] = pair[1];
  });

  return obj;
};

module.exports = _;

},{"deep-equal":"/Users/justin/git/formatic/node_modules/deep-equal/index.js","object-assign":"/Users/justin/git/formatic/node_modules/object-assign/index.js"}],"/Users/justin/git/formatic/node_modules/deep-equal/index.js":[function(require,module,exports){
var pSlice = Array.prototype.slice;
var objectKeys = require('./lib/keys.js');
var isArguments = require('./lib/is_arguments.js');

var deepEqual = module.exports = function (actual, expected, opts) {
  if (!opts) opts = {};
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, opts);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer (x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') return false;
  return true;
}

function objEquiv(a, b, opts) {
  var i, key;
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b, opts);
  }
  if (isBuffer(a)) {
    if (!isBuffer(b)) {
      return false;
    }
    if (a.length !== b.length) return false;
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b);
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) return false;
  }
  return typeof a === typeof b;
}

},{"./lib/is_arguments.js":"/Users/justin/git/formatic/node_modules/deep-equal/lib/is_arguments.js","./lib/keys.js":"/Users/justin/git/formatic/node_modules/deep-equal/lib/keys.js"}],"/Users/justin/git/formatic/node_modules/deep-equal/lib/is_arguments.js":[function(require,module,exports){
var supportsArgumentsClass = (function(){
  return Object.prototype.toString.call(arguments)
})() == '[object Arguments]';

exports = module.exports = supportsArgumentsClass ? supported : unsupported;

exports.supported = supported;
function supported(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
};

exports.unsupported = unsupported;
function unsupported(object){
  return object &&
    typeof object == 'object' &&
    typeof object.length == 'number' &&
    Object.prototype.hasOwnProperty.call(object, 'callee') &&
    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
    false;
};

},{}],"/Users/justin/git/formatic/node_modules/deep-equal/lib/keys.js":[function(require,module,exports){
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}

},{}],"/Users/justin/git/formatic/node_modules/object-assign/index.js":[function(require,module,exports){
'use strict';

function ToObject(val) {
	if (val == null) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var from;
	var keys;
	var to = ToObject(target);

	for (var s = 1; s < arguments.length; s++) {
		from = arguments[s];
		keys = Object.keys(Object(from));

		for (var i = 0; i < keys.length; i++) {
			to[keys[i]] = from[keys[i]];
		}
	}

	return to;
};

},{}]},{},["/Users/justin/git/formatic/index.js"])("/Users/justin/git/formatic/index.js")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanVzdGluL2dpdC9mb3JtYXRpYy9pbmRleC5qcyIsImxpYi9jb21wb25lbnRzL2NvbnRhaW5lcnMvb2JqZWN0LmpzIiwibGliL2NvbXBvbmVudHMvY29udGFpbmVycy9zdHJpbmctaW5wdXQuanMiLCJsaWIvY29tcG9uZW50cy9jcmVhdGUtZmllbGQuanMiLCJsaWIvY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkLmpzIiwibGliL2NvbXBvbmVudHMvaGVscGVycy9oZWxwLmpzIiwibGliL2NvbXBvbmVudHMvaGVscGVycy9sYWJlbC5qcyIsImxpYi9jb21wb25lbnRzL2luZGV4LmpzIiwibGliL2NvbXBvbmVudHMvaW5wdXRzL3N0cmluZy5qcyIsImxpYi9jb21wb25lbnRzL3VzZS1jb250ZXh0LmpzIiwibGliL2NvbXBvbmVudHMvd3JhcC1jaGlsZC1pbnB1dC5qcyIsImxpYi9jb21wb25lbnRzL3dyYXAtaW5wdXQuanMiLCJsaWIvY29tcG9uZW50cy93cmFwLXB1cmUuanMiLCJsaWIvZm9ybWF0aWMuanMiLCJsaWIvcmVhY3QtdXRpbHMuanMiLCIvVXNlcnMvanVzdGluL2dpdC9mb3JtYXRpYy9saWIvdW5kYXNoLmpzIiwibm9kZV9tb2R1bGVzL2RlZXAtZXF1YWwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGVlcC1lcXVhbC9saWIvaXNfYXJndW1lbnRzLmpzIiwibm9kZV9tb2R1bGVzL2RlZXAtZXF1YWwvbGliL2tleXMuanMiLCJub2RlX21vZHVsZXMvb2JqZWN0LWFzc2lnbi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FDR0EsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7O0FDSDNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDN0NBLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7QUFFWCxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQy9DLENBQUMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOzs7OztBQUtsQyxDQUFDLENBQUMsT0FBTyxHQUFHLFVBQUMsTUFBTTtTQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUM7Q0FBQSxDQUFDOztBQUVwRCxDQUFDLENBQUMsUUFBUSxHQUFHLFVBQUEsS0FBSztTQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVE7Q0FBQSxDQUFDO0FBQ2hELENBQUMsQ0FBQyxXQUFXLEdBQUcsVUFBQSxLQUFLO1NBQUksT0FBTyxLQUFLLEtBQUssV0FBVztDQUFBLENBQUM7QUFDdEQsQ0FBQyxDQUFDLFFBQVEsR0FBRyxVQUFBLEtBQUs7U0FBSSxPQUFPLEtBQUssS0FBSyxRQUFRO0NBQUEsQ0FBQztBQUNoRCxDQUFDLENBQUMsT0FBTyxHQUFHLFVBQUEsS0FBSztTQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxnQkFBZ0I7Q0FBQSxDQUFDO0FBQ2hGLENBQUMsQ0FBQyxRQUFRLEdBQUcsVUFBQSxLQUFLO1NBQUksT0FBTyxLQUFLLEtBQUssUUFBUTtDQUFBLENBQUM7QUFDaEQsQ0FBQyxDQUFDLFNBQVMsR0FBRyxVQUFBLEtBQUs7U0FBSSxPQUFPLEtBQUssS0FBSyxTQUFTO0NBQUEsQ0FBQztBQUNsRCxDQUFDLENBQUMsTUFBTSxHQUFHLFVBQUEsS0FBSztTQUFJLEtBQUssS0FBSyxJQUFJO0NBQUEsQ0FBQztBQUNuQyxDQUFDLENBQUMsVUFBVSxHQUFHLFVBQUEsS0FBSztTQUFJLE9BQU8sS0FBSyxLQUFLLFVBQVU7Q0FBQSxDQUFDOztBQUVwRCxDQUFDLENBQUMsS0FBSyxHQUFHLFVBQUEsS0FBSyxFQUFJO0FBQ2pCLE1BQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3RCLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7QUFDRCxTQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQy9ELENBQUM7O0FBRUYsQ0FBQyxDQUFDLElBQUksR0FBRyxVQUFDLEtBQUssRUFBRSxNQUFNLEVBQUs7QUFDMUIsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDckMsUUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDcEIsYUFBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7R0FDRjtBQUNELFNBQU8sS0FBSyxDQUFDLENBQUM7Q0FDZixDQUFDOztBQUVGLENBQUMsQ0FBQyxLQUFLLEdBQUcsVUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFLO0FBQzNCLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3JDLFFBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDckIsYUFBTyxLQUFLLENBQUM7S0FDZDtHQUNGO0FBQ0QsU0FBTyxJQUFJLENBQUM7Q0FDYixDQUFDOztBQUVGLENBQUMsQ0FBQyxJQUFJLEdBQUcsVUFBQyxHQUFHLEVBQUUsU0FBUyxFQUFLO0FBQzNCLFFBQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRyxFQUFJO0FBQzlCLGFBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7R0FDMUIsQ0FBQyxDQUFDO0NBQ0osQ0FBQzs7QUFFRixDQUFDLENBQUMsTUFBTSxHQUFHLFVBQUMsS0FBSyxFQUFLO0FBQ3BCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQzs7QUFFZixPQUFLLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQ3BCLE9BQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDeEIsQ0FBQyxDQUFDOztBQUVILFNBQU8sR0FBRyxDQUFDO0NBQ1osQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQzs7O0FDNURuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyAjIGluZGV4XG5cbi8vIEV4cG9ydCB0aGUgRm9ybWF0aWMgUmVhY3QgY2xhc3MgYXQgdGhlIHRvcCBsZXZlbC5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvZm9ybWF0aWMnKTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9yZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydSZWFjdCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnUmVhY3QnXSA6IG51bGwpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF91bmRhc2ggPSByZXF1aXJlKCcuLi8uLi91bmRhc2gnKTtcblxudmFyIF91bmRhc2gyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdW5kYXNoKTtcblxudmFyIF9yZWFjdFV0aWxzID0gcmVxdWlyZSgnLi4vLi4vcmVhY3QtdXRpbHMnKTtcblxudmFyIE9iamVjdENvbnRhaW5lciA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0Q29udGFpbmVyJyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICB2YWx1ZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5vYmplY3QsXG4gICAgb25DaGFuZ2U6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIGNvbXBvbmVudHM6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWRcbiAgfSxcblxuICB2YWx1ZTogZnVuY3Rpb24gdmFsdWUoKSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5wcm9wcy52YWx1ZTtcblxuICAgIGlmIChfdW5kYXNoMlsnZGVmYXVsdCddLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH0sXG5cbiAgb25DaGFuZ2VDaGlsZDogZnVuY3Rpb24gb25DaGFuZ2VDaGlsZChuZXdDaGlsZFZhbHVlLCBpbmZvKSB7XG4gICAgdmFyIGtleSA9IGluZm8ucGF0aFswXTtcbiAgICB2YXIgbmV3VmFsdWUgPSBfdW5kYXNoMlsnZGVmYXVsdCddLmV4dGVuZCh7fSwgdGhpcy52YWx1ZSgpLCBfZGVmaW5lUHJvcGVydHkoe30sIGtleSwgbmV3Q2hpbGRWYWx1ZSkpO1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIGNoaWxkQ29udGV4dFR5cGVzOiB7XG4gICAgb25DaGFuZ2VDaGlsZDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgY29tcG9uZW50czogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZFxuICB9LFxuXG4gIGdldENoaWxkQ29udGV4dDogZnVuY3Rpb24gZ2V0Q2hpbGRDb250ZXh0KCkge1xuICAgIHJldHVybiB7XG4gICAgICBvbkNoYW5nZUNoaWxkOiB0aGlzLm9uQ2hhbmdlQ2hpbGQsXG4gICAgICBjb21wb25lbnRzOiB0aGlzLnByb3BzLmNvbXBvbmVudHNcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBwcm9wcyA9IHRoaXMuZ2V0Q2hpbGRDb250ZXh0KCk7XG4gICAgaWYgKHRoaXMucHJvcHMub25SZW5kZXIpIHtcbiAgICAgIHByb3BzLm9uUmVuZGVyID0gdGhpcy5wcm9wcy5vblJlbmRlcjtcbiAgICB9XG4gICAgcmV0dXJuICgwLCBfcmVhY3RVdGlscy5jbG9uZUNoaWxkKSh0aGlzLnByb3BzLmNoaWxkcmVuLCBwcm9wcyk7XG4gIH1cbn0pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBPYmplY3RDb250YWluZXI7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJaTlWYzJWeWN5OXFkWE4wYVc0dloybDBMMlp2Y20xaGRHbGpMMnhwWWk5amIyMXdiMjVsYm5SekwyTnZiblJoYVc1bGNuTXZiMkpxWldOMExtcHpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSTdPenM3T3pzN096czdPM0ZDUVVGclFpeFBRVUZQT3pzN08zTkNRVVZZTEdOQlFXTTdPenM3TUVKQlEwZ3NiVUpCUVcxQ096dEJRVVUxUXl4SlFVRk5MR1ZCUVdVc1IwRkJSeXh0UWtGQlRTeFhRVUZYTEVOQlFVTTdPenRCUVVWNFF5eFhRVUZUTEVWQlFVVTdRVUZEVkN4VFFVRkxMRVZCUVVVc2JVSkJRVTBzVTBGQlV5eERRVUZETEUxQlFVMDdRVUZETjBJc1dVRkJVU3hGUVVGRkxHMUNRVUZOTEZOQlFWTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWVHRCUVVONlF5eGpRVUZWTEVWQlFVVXNiVUpCUVUwc1UwRkJVeXhEUVVGRExFMUJRVTBzUTBGQlF5eFZRVUZWTzBkQlF6bERPenRCUVVWRUxFOUJRVXNzUlVGQlFTeHBRa0ZCUnp0UlFVTkRMRXRCUVVzc1IwRkJTU3hKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZ1UWl4TFFVRkxPenRCUVVOYUxGRkJRVWtzYjBKQlFVVXNWMEZCVnl4RFFVRkRMRXRCUVVzc1EwRkJReXhGUVVGRk8wRkJRM2hDTEdGQlFVOHNSVUZCUlN4RFFVRkRPMHRCUTFnN1FVRkRSQ3hYUVVGUExFdEJRVXNzUTBGQlF6dEhRVU5rT3p0QlFVVkVMR1ZCUVdFc1JVRkJRU3gxUWtGQlF5eGhRVUZoTEVWQlFVVXNTVUZCU1N4RlFVRkZPMEZCUTJwRExGRkJRVTBzUjBGQlJ5eEhRVUZITEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03UVVGRGVrSXNVVUZCVFN4UlFVRlJMRWRCUVVjc2IwSkJRVVVzVFVGQlRTeERRVUZETEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1MwRkJTeXhGUVVGRkxITkNRVU4yUXl4SFFVRkhMRVZCUVVjc1lVRkJZU3hGUVVOd1FpeERRVUZETzBGQlEwZ3NVVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zVVVGQlVTeEZRVUZGTEVsQlFVa3NRMEZCUXl4RFFVRkRPMGRCUTNKRE96dEJRVVZFTEcxQ1FVRnBRaXhGUVVGRk8wRkJRMnBDTEdsQ1FVRmhMRVZCUVVVc2JVSkJRVTBzVTBGQlV5eERRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZPMEZCUXpsRExHTkJRVlVzUlVGQlJTeHRRa0ZCVFN4VFFVRlRMRU5CUVVNc1RVRkJUU3hEUVVGRExGVkJRVlU3UjBGRE9VTTdPMEZCUlVRc2FVSkJRV1VzUlVGQlFTd3lRa0ZCUnp0QlFVTm9RaXhYUVVGUE8wRkJRMHdzYlVKQlFXRXNSVUZCUlN4SlFVRkpMRU5CUVVNc1lVRkJZVHRCUVVOcVF5eG5Ra0ZCVlN4RlFVRkZMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zVlVGQlZUdExRVU5zUXl4RFFVRkRPMGRCUTBnN08wRkJSVVFzVVVGQlRTeEZRVUZCTEd0Q1FVRkhPMEZCUTFBc1VVRkJUU3hMUVVGTExFZEJRVWNzU1VGQlNTeERRVUZETEdWQlFXVXNSVUZCUlN4RFFVRkRPMEZCUTNKRExGRkJRVWtzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJMRVZCUVVVN1FVRkRka0lzVjBGQlN5eERRVUZETEZGQlFWRXNSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF6dExRVU4wUXp0QlFVTkVMRmRCUVU4c05FSkJRVmNzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJMRVZCUVVVc1MwRkJTeXhEUVVGRExFTkJRVU03UjBGREwwTTdRMEZEUml4RFFVRkRMRU5CUVVNN08zRkNRVVZaTEdWQlFXVWlMQ0ptYVd4bElqb2laMlZ1WlhKaGRHVmtMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE5EYjI1MFpXNTBJanBiSW1sdGNHOXlkQ0JTWldGamRDQm1jbTl0SUNkeVpXRmpkQ2M3WEc1Y2JtbHRjRzl5ZENCMUlHWnliMjBnSnk0dUx5NHVMM1Z1WkdGemFDYzdYRzVwYlhCdmNuUWdlMk5zYjI1bFEyaHBiR1I5SUdaeWIyMGdKeTR1THk0dUwzSmxZV04wTFhWMGFXeHpKenRjYmx4dVkyOXVjM1FnVDJKcVpXTjBRMjl1ZEdGcGJtVnlJRDBnVW1WaFkzUXVZM0psWVhSbFEyeGhjM01vZTF4dVhHNGdJSEJ5YjNCVWVYQmxjem9nZTF4dUlDQWdJSFpoYkhWbE9pQlNaV0ZqZEM1UWNtOXdWSGx3WlhNdWIySnFaV04wTEZ4dUlDQWdJRzl1UTJoaGJtZGxPaUJTWldGamRDNVFjbTl3Vkhsd1pYTXVablZ1WXk1cGMxSmxjWFZwY21Wa0xGeHVJQ0FnSUdOdmJYQnZibVZ1ZEhNNklGSmxZV04wTGxCeWIzQlVlWEJsY3k1dlltcGxZM1F1YVhOU1pYRjFhWEpsWkZ4dUlDQjlMRnh1WEc0Z0lIWmhiSFZsS0NrZ2UxeHVJQ0FnSUdOdmJuTjBJSHQyWVd4MVpYMGdQU0IwYUdsekxuQnliM0J6TzF4dUlDQWdJR2xtSUNoMUxtbHpWVzVrWldacGJtVmtLSFpoYkhWbEtTa2dlMXh1SUNBZ0lDQWdjbVYwZFhKdUlIdDlPMXh1SUNBZ0lIMWNiaUFnSUNCeVpYUjFjbTRnZG1Gc2RXVTdYRzRnSUgwc1hHNWNiaUFnYjI1RGFHRnVaMlZEYUdsc1pDaHVaWGREYUdsc1pGWmhiSFZsTENCcGJtWnZLU0I3WEc0Z0lDQWdZMjl1YzNRZ2EyVjVJRDBnYVc1bWJ5NXdZWFJvV3pCZE8xeHVJQ0FnSUdOdmJuTjBJRzVsZDFaaGJIVmxJRDBnZFM1bGVIUmxibVFvZTMwc0lIUm9hWE11ZG1Gc2RXVW9LU3dnZTF4dUlDQWdJQ0FnVzJ0bGVWMDZJRzVsZDBOb2FXeGtWbUZzZFdWY2JpQWdJQ0I5S1R0Y2JpQWdJQ0IwYUdsekxuQnliM0J6TG05dVEyaGhibWRsS0c1bGQxWmhiSFZsTENCcGJtWnZLVHRjYmlBZ2ZTeGNibHh1SUNCamFHbHNaRU52Ym5SbGVIUlVlWEJsY3pvZ2UxeHVJQ0FnSUc5dVEyaGhibWRsUTJocGJHUTZJRkpsWVdOMExsQnliM0JVZVhCbGN5NW1kVzVqTG1selVtVnhkV2x5WldRc1hHNGdJQ0FnWTI5dGNHOXVaVzUwY3pvZ1VtVmhZM1F1VUhKdmNGUjVjR1Z6TG05aWFtVmpkQzVwYzFKbGNYVnBjbVZrWEc0Z0lIMHNYRzVjYmlBZ1oyVjBRMmhwYkdSRGIyNTBaWGgwS0NrZ2UxeHVJQ0FnSUhKbGRIVnliaUI3WEc0Z0lDQWdJQ0J2YmtOb1lXNW5aVU5vYVd4a09pQjBhR2x6TG05dVEyaGhibWRsUTJocGJHUXNYRzRnSUNBZ0lDQmpiMjF3YjI1bGJuUnpPaUIwYUdsekxuQnliM0J6TG1OdmJYQnZibVZ1ZEhOY2JpQWdJQ0I5TzF4dUlDQjlMRnh1WEc0Z0lISmxibVJsY2lncElIdGNiaUFnSUNCamIyNXpkQ0J3Y205d2N5QTlJSFJvYVhNdVoyVjBRMmhwYkdSRGIyNTBaWGgwS0NrN1hHNGdJQ0FnYVdZZ0tIUm9hWE11Y0hKdmNITXViMjVTWlc1a1pYSXBJSHRjYmlBZ0lDQWdJSEJ5YjNCekxtOXVVbVZ1WkdWeUlEMGdkR2hwY3k1d2NtOXdjeTV2YmxKbGJtUmxjanRjYmlBZ0lDQjlYRzRnSUNBZ2NtVjBkWEp1SUdOc2IyNWxRMmhwYkdRb2RHaHBjeTV3Y205d2N5NWphR2xzWkhKbGJpd2djSEp2Y0hNcE8xeHVJQ0I5WEc1OUtUdGNibHh1Wlhod2IzSjBJR1JsWm1GMWJIUWdUMkpxWldOMFEyOXVkR0ZwYm1WeU8xeHVJbDE5IiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMob2JqLCBrZXlzKSB7IHZhciB0YXJnZXQgPSB7fTsgZm9yICh2YXIgaSBpbiBvYmopIHsgaWYgKGtleXMuaW5kZXhPZihpKSA+PSAwKSBjb250aW51ZTsgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBpKSkgY29udGludWU7IHRhcmdldFtpXSA9IG9ialtpXTsgfSByZXR1cm4gdGFyZ2V0OyB9XG5cbnZhciBfcmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snUmVhY3QnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ1JlYWN0J10gOiBudWxsKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcmVhY3RVdGlscyA9IHJlcXVpcmUoJy4uLy4uL3JlYWN0LXV0aWxzJyk7XG5cbnZhciBTdHJpbmdJbnB1dENvbnRhaW5lciA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnU3RyaW5nSW5wdXRDb250YWluZXInLFxuXG4gIHByb3BUeXBlczoge1xuICAgIHZhbHVlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIG9uQ2hhbmdlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZFxuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgIHZhciBjaGlsZHJlbiA9IF9wcm9wcy5jaGlsZHJlbjtcblxuICAgIHZhciBwcm9wcyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhfcHJvcHMsIFsnY2hpbGRyZW4nXSk7XG5cbiAgICByZXR1cm4gKDAsIF9yZWFjdFV0aWxzLmNsb25lQ2hpbGQpKHRoaXMucHJvcHMuY2hpbGRyZW4sIHByb3BzKTtcbiAgfVxufSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFN0cmluZ0lucHV0Q29udGFpbmVyO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSWk5VmMyVnljeTlxZFhOMGFXNHZaMmwwTDJadmNtMWhkR2xqTDJ4cFlpOWpiMjF3YjI1bGJuUnpMMk52Ym5SaGFXNWxjbk12YzNSeWFXNW5MV2x1Y0hWMExtcHpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSTdPenM3T3pzN096czdPM0ZDUVVGclFpeFBRVUZQT3pzN096QkNRVVZCTEcxQ1FVRnRRanM3UVVGRk5VTXNTVUZCVFN4dlFrRkJiMElzUjBGQlJ5eHRRa0ZCVFN4WFFVRlhMRU5CUVVNN096dEJRVVUzUXl4WFFVRlRMRVZCUVVVN1FVRkRWQ3hUUVVGTExFVkJRVVVzYlVKQlFVMHNVMEZCVXl4RFFVRkRMRTFCUVUwc1EwRkJReXhWUVVGVk8wRkJRM2hETEZsQlFWRXNSVUZCUlN4dFFrRkJUU3hUUVVGVExFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVTdSMEZETVVNN08wRkJSVVFzVVVGQlRTeEZRVUZCTEd0Q1FVRkhPMmxDUVVOelFpeEpRVUZKTEVOQlFVTXNTMEZCU3p0UlFVRm9ReXhSUVVGUkxGVkJRVklzVVVGQlVUczdVVUZCU3l4TFFVRkxPenRCUVVWNlFpeFhRVUZQTERSQ1FVRlhMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zVVVGQlVTeEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRPMGRCUXk5RE8wTkJRMFlzUTBGQlF5eERRVUZET3p0eFFrRkZXU3h2UWtGQmIwSWlMQ0ptYVd4bElqb2laMlZ1WlhKaGRHVmtMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE5EYjI1MFpXNTBJanBiSW1sdGNHOXlkQ0JTWldGamRDQm1jbTl0SUNkeVpXRmpkQ2M3WEc1Y2JtbHRjRzl5ZENCN1kyeHZibVZEYUdsc1pIMGdabkp2YlNBbkxpNHZMaTR2Y21WaFkzUXRkWFJwYkhNbk8xeHVYRzVqYjI1emRDQlRkSEpwYm1kSmJuQjFkRU52Ym5SaGFXNWxjaUE5SUZKbFlXTjBMbU55WldGMFpVTnNZWE56S0h0Y2JseHVJQ0J3Y205d1ZIbHdaWE02SUh0Y2JpQWdJQ0IyWVd4MVpUb2dVbVZoWTNRdVVISnZjRlI1Y0dWekxuTjBjbWx1Wnk1cGMxSmxjWFZwY21Wa0xGeHVJQ0FnSUc5dVEyaGhibWRsT2lCU1pXRmpkQzVRY205d1ZIbHdaWE11Wm5WdVl5NXBjMUpsY1hWcGNtVmtYRzRnSUgwc1hHNWNiaUFnY21WdVpHVnlLQ2tnZTF4dUlDQWdJR052Ym5OMElIdGphR2xzWkhKbGJpd2dMaTR1Y0hKdmNITjlJRDBnZEdocGN5NXdjbTl3Y3p0Y2JseHVJQ0FnSUhKbGRIVnliaUJqYkc5dVpVTm9hV3hrS0hSb2FYTXVjSEp2Y0hNdVkyaHBiR1J5Wlc0c0lIQnliM0J6S1R0Y2JpQWdmVnh1ZlNrN1hHNWNibVY0Y0c5eWRDQmtaV1poZFd4MElGTjBjbWx1WjBsdWNIVjBRMjl1ZEdGcGJtVnlPMXh1SWwxOSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9yZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydSZWFjdCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnUmVhY3QnXSA6IG51bGwpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIGNyZWF0ZUZpZWxkID0gZnVuY3Rpb24gY3JlYXRlRmllbGQoSW5wdXQpIHtcbiAgdmFyIF9yZWYgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1sxXTtcblxuICB2YXIgbmFtZSA9IF9yZWYubmFtZTtcblxuICBpZiAoIW5hbWUpIHtcbiAgICBpZiAoSW5wdXQuZGlzcGxheU5hbWUuaW5kZXhPZignSW5wdXQnKSA+IDApIHtcbiAgICAgIG5hbWUgPSBJbnB1dC5kaXNwbGF5TmFtZS5zdWJzdHJpbmcoMCwgSW5wdXQuZGlzcGxheU5hbWUuaW5kZXhPZignSW5wdXQnKSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdGaWVsZCByZXF1aXJlcyBhIGRpc3BsYXlOYW1lLicpO1xuICB9XG5cbiAgdmFyIEZpZWxkSW5wdXQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IG5hbWUsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgIGNvbXBvbmVudHM6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWRcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICB2YXIgRmllbGQgPSB0aGlzLnByb3BzLmNvbXBvbmVudHMuRmllbGQ7XG5cbiAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgRmllbGQsXG4gICAgICAgIHRoaXMucHJvcHMsXG4gICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KElucHV0LCB0aGlzLnByb3BzKVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBGaWVsZElucHV0O1xufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gY3JlYXRlRmllbGQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJaTlWYzJWeWN5OXFkWE4wYVc0dloybDBMMlp2Y20xaGRHbGpMMnhwWWk5amIyMXdiMjVsYm5SekwyTnlaV0YwWlMxbWFXVnNaQzVxY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pT3pzN096czdPenM3Y1VKQlFXdENMRTlCUVU4N096czdRVUZGZWtJc1NVRkJUU3hYUVVGWExFZEJRVWNzVTBGQlpDeFhRVUZYTEVOQlFVa3NTMEZCU3l4RlFVRnJRanR0UlVGQlVDeEZRVUZGT3p0TlFVRldMRWxCUVVrc1VVRkJTaXhKUVVGSk96dEJRVVV2UWl4TlFVRkpMRU5CUVVNc1NVRkJTU3hGUVVGRk8wRkJRMVFzVVVGQlNTeExRVUZMTEVOQlFVTXNWMEZCVnl4RFFVRkRMRTlCUVU4c1EwRkJReXhQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEVWQlFVVTdRVUZETVVNc1ZVRkJTU3hIUVVGSExFdEJRVXNzUTBGQlF5eFhRVUZYTEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hMUVVGTExFTkJRVU1zVjBGQlZ5eERRVUZETEU5QlFVOHNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRE8wdEJRek5GTzBkQlEwWTdPMEZCUlVRc1RVRkJTU3hEUVVGRExFbEJRVWtzUlVGQlJUdEJRVU5VTEZWQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc0swSkJRU3RDTEVOQlFVTXNRMEZCUXp0SFFVTnNSRHM3UVVGRlJDeE5RVUZOTEZWQlFWVXNSMEZCUnl4dFFrRkJUU3hYUVVGWExFTkJRVU03TzBGQlJXNURMR1ZCUVZjc1JVRkJSU3hKUVVGSk96dEJRVVZxUWl4aFFVRlRMRVZCUVVVN1FVRkRWQ3huUWtGQlZTeEZRVUZGTEcxQ1FVRk5MRk5CUVZNc1EwRkJReXhOUVVGTkxFTkJRVU1zVlVGQlZUdExRVU01UXpzN1FVRkZSQ3hWUVVGTkxFVkJRVUVzYTBKQlFVYzdWVUZGUVN4TFFVRkxMRWRCUVVrc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eFZRVUZWTEVOQlFUbENMRXRCUVVzN08wRkJSVm9zWVVGRFJUdEJRVUZETEdGQlFVczdVVUZCU3l4SlFVRkpMRU5CUVVNc1MwRkJTenRSUVVOdVFpeHBRMEZCUXl4TFFVRkxMRVZCUVVzc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlJ6dFBRVU5zUWl4RFFVTlNPMHRCUTBnN1IwRkRSaXhEUVVGRExFTkJRVU03TzBGQlJVZ3NVMEZCVHl4VlFVRlZMRU5CUVVNN1EwRkRia0lzUTBGQlF6czdjVUpCUldFc1YwRkJWeUlzSW1acGJHVWlPaUpuWlc1bGNtRjBaV1F1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sYzBOdmJuUmxiblFpT2xzaWFXMXdiM0owSUZKbFlXTjBJR1p5YjIwZ0ozSmxZV04wSnp0Y2JseHVZMjl1YzNRZ1kzSmxZWFJsUm1sbGJHUWdQU0FvU1c1d2RYUXNJSHR1WVcxbGZTQTlJSHQ5S1NBOVBpQjdYRzVjYmlBZ2FXWWdLQ0Z1WVcxbEtTQjdYRzRnSUNBZ2FXWWdLRWx1Y0hWMExtUnBjM0JzWVhsT1lXMWxMbWx1WkdWNFQyWW9KMGx1Y0hWMEp5a2dQaUF3S1NCN1hHNGdJQ0FnSUNCdVlXMWxJRDBnU1c1d2RYUXVaR2x6Y0d4aGVVNWhiV1V1YzNWaWMzUnlhVzVuS0RBc0lFbHVjSFYwTG1ScGMzQnNZWGxPWVcxbExtbHVaR1Y0VDJZb0owbHVjSFYwSnlrcE8xeHVJQ0FnSUgxY2JpQWdmVnh1WEc0Z0lHbG1JQ2doYm1GdFpTa2dlMXh1SUNBZ0lIUm9jbTkzSUc1bGR5QkZjbkp2Y2lnblJtbGxiR1FnY21WeGRXbHlaWE1nWVNCa2FYTndiR0Y1VG1GdFpTNG5LVHRjYmlBZ2ZWeHVYRzRnSUdOdmJuTjBJRVpwWld4a1NXNXdkWFFnUFNCU1pXRmpkQzVqY21WaGRHVkRiR0Z6Y3loN1hHNWNiaUFnSUNCa2FYTndiR0Y1VG1GdFpUb2dibUZ0WlN4Y2JseHVJQ0FnSUhCeWIzQlVlWEJsY3pvZ2UxeHVJQ0FnSUNBZ1kyOXRjRzl1Wlc1MGN6b2dVbVZoWTNRdVVISnZjRlI1Y0dWekxtOWlhbVZqZEM1cGMxSmxjWFZwY21Wa1hHNGdJQ0FnZlN4Y2JseHVJQ0FnSUhKbGJtUmxjaWdwSUh0Y2JseHVJQ0FnSUNBZ1kyOXVjM1FnZTBacFpXeGtmU0E5SUhSb2FYTXVjSEp2Y0hNdVkyOXRjRzl1Wlc1MGN6dGNibHh1SUNBZ0lDQWdjbVYwZFhKdUlDaGNiaUFnSUNBZ0lDQWdQRVpwWld4a0lIc3VMaTUwYUdsekxuQnliM0J6ZlQ1Y2JpQWdJQ0FnSUNBZ0lDQThTVzV3ZFhRZ2V5NHVMblJvYVhNdWNISnZjSE45THo1Y2JpQWdJQ0FnSUNBZ1BDOUdhV1ZzWkQ1Y2JpQWdJQ0FnSUNrN1hHNGdJQ0FnZlZ4dUlDQjlLVHRjYmx4dUlDQnlaWFIxY200Z1JtbGxiR1JKYm5CMWREdGNibjA3WEc1Y2JtVjRjRzl5ZENCa1pXWmhkV3gwSUdOeVpXRjBaVVpwWld4a08xeHVJbDE5IiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3JlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ1JlYWN0J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydSZWFjdCddIDogbnVsbCk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgRmllbGQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0ZpZWxkJyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBjb21wb25lbnRzOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkXG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIF9wcm9wcyRjb21wb25lbnRzID0gdGhpcy5wcm9wcy5jb21wb25lbnRzO1xuICAgIHZhciBMYWJlbCA9IF9wcm9wcyRjb21wb25lbnRzLkxhYmVsO1xuICAgIHZhciBIZWxwID0gX3Byb3BzJGNvbXBvbmVudHMuSGVscDtcblxuICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICdkaXYnLFxuICAgICAgbnVsbCxcbiAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KExhYmVsLCB0aGlzLnByb3BzKSxcbiAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEhlbHAsIHRoaXMucHJvcHMpLFxuICAgICAgdGhpcy5wcm9wcy5jaGlsZHJlblxuICAgICk7XG4gIH1cbn0pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBGaWVsZDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYklpOVZjMlZ5Y3k5cWRYTjBhVzR2WjJsMEwyWnZjbTFoZEdsakwyeHBZaTlqYjIxd2IyNWxiblJ6TDJobGJIQmxjbk12Wm1sbGJHUXVhbk1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanM3T3pzN096czdPM0ZDUVVGclFpeFBRVUZQT3pzN08wRkJSWHBDTEVsQlFVMHNTMEZCU3l4SFFVRkhMRzFDUVVGTkxGZEJRVmNzUTBGQlF6czdPMEZCUlRsQ0xGZEJRVk1zUlVGQlJUdEJRVU5VTEdOQlFWVXNSVUZCUlN4dFFrRkJUU3hUUVVGVExFTkJRVU1zVFVGQlRTeERRVUZETEZWQlFWVTdSMEZET1VNN08wRkJSVVFzVVVGQlRTeEZRVUZCTEd0Q1FVRkhPelJDUVVObExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNWVUZCVlR0UlFVRndReXhMUVVGTExIRkNRVUZNTEV0QlFVczdVVUZCUlN4SlFVRkpMSEZDUVVGS0xFbEJRVWs3TzBGQlJXeENMRmRCUTBVN096dE5RVU5GTEdsRFFVRkRMRXRCUVVzc1JVRkJTeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZITzAxQlEzaENMR2xEUVVGRExFbEJRVWtzUlVGQlN5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkhPMDFCUTNSQ0xFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNVVUZCVVR0TFFVTm9RaXhEUVVOT08wZEJRMGc3UTBGRFJpeERRVUZETEVOQlFVTTdPM0ZDUVVWWkxFdEJRVXNpTENKbWFXeGxJam9pWjJWdVpYSmhkR1ZrTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYkltbHRjRzl5ZENCU1pXRmpkQ0JtY205dElDZHlaV0ZqZENjN1hHNWNibU52Ym5OMElFWnBaV3hrSUQwZ1VtVmhZM1F1WTNKbFlYUmxRMnhoYzNNb2UxeHVYRzRnSUhCeWIzQlVlWEJsY3pvZ2UxeHVJQ0FnSUdOdmJYQnZibVZ1ZEhNNklGSmxZV04wTGxCeWIzQlVlWEJsY3k1dlltcGxZM1F1YVhOU1pYRjFhWEpsWkZ4dUlDQjlMRnh1WEc0Z0lISmxibVJsY2lncElIdGNiaUFnSUNCamIyNXpkQ0I3VEdGaVpXd3NJRWhsYkhCOUlEMGdkR2hwY3k1d2NtOXdjeTVqYjIxd2IyNWxiblJ6TzF4dVhHNGdJQ0FnY21WMGRYSnVJQ2hjYmlBZ0lDQWdJRHhrYVhZK1hHNGdJQ0FnSUNBZ0lEeE1ZV0psYkNCN0xpNHVkR2hwY3k1d2NtOXdjMzB2UGx4dUlDQWdJQ0FnSUNBOFNHVnNjQ0I3TGk0dWRHaHBjeTV3Y205d2MzMHZQbHh1SUNBZ0lDQWdJQ0I3ZEdocGN5NXdjbTl3Y3k1amFHbHNaSEpsYm4xY2JpQWdJQ0FnSUR3dlpHbDJQbHh1SUNBZ0lDazdYRzRnSUgxY2JuMHBPMXh1WEc1bGVIQnZjblFnWkdWbVlYVnNkQ0JHYVdWc1pEdGNiaUpkZlE9PSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9yZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydSZWFjdCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnUmVhY3QnXSA6IG51bGwpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIEhlbHAgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0hlbHAnLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBoZWxwID0gdGhpcy5wcm9wcy5oZWxwO1xuXG4gICAgcmV0dXJuICFoZWxwID8gbnVsbCA6IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgJ2RpdicsXG4gICAgICBudWxsLFxuICAgICAgaGVscFxuICAgICk7XG4gIH1cbn0pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBIZWxwO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSWk5VmMyVnljeTlxZFhOMGFXNHZaMmwwTDJadmNtMWhkR2xqTDJ4cFlpOWpiMjF3YjI1bGJuUnpMMmhsYkhCbGNuTXZhR1ZzY0M1cWN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU96czdPenM3T3pzN2NVSkJRV3RDTEU5QlFVODdPenM3UVVGRmVrSXNTVUZCVFN4SlFVRkpMRWRCUVVjc2JVSkJRVTBzVjBGQlZ5eERRVUZET3pzN1FVRkZOMElzVVVGQlRTeEZRVUZCTEd0Q1FVRkhPMUZCUTBFc1NVRkJTU3hIUVVGSkxFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFXeENMRWxCUVVrN08wRkJSVmdzVjBGQlR5eERRVUZETEVsQlFVa3NSMEZCUnl4SlFVRkpMRWRCUTJwQ096czdUVUZEUnl4SlFVRkpPMHRCUTBRc1FVRkRVQ3hEUVVGRE8wZEJRMGc3UTBGRFJpeERRVUZETEVOQlFVTTdPM0ZDUVVWWkxFbEJRVWtpTENKbWFXeGxJam9pWjJWdVpYSmhkR1ZrTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYkltbHRjRzl5ZENCU1pXRmpkQ0JtY205dElDZHlaV0ZqZENjN1hHNWNibU52Ym5OMElFaGxiSEFnUFNCU1pXRmpkQzVqY21WaGRHVkRiR0Z6Y3loN1hHNWNiaUFnY21WdVpHVnlLQ2tnZTF4dUlDQWdJR052Ym5OMElIdG9aV3h3ZlNBOUlIUm9hWE11Y0hKdmNITTdYRzVjYmlBZ0lDQnlaWFIxY200Z0lXaGxiSEFnUHlCdWRXeHNJRG9nS0Z4dUlDQWdJQ0FnUEdScGRqNWNiaUFnSUNBZ0lDQWdlMmhsYkhCOVhHNGdJQ0FnSUNBOEwyUnBkajVjYmlBZ0lDQXBPMXh1SUNCOVhHNTlLVHRjYmx4dVpYaHdiM0owSUdSbFptRjFiSFFnU0dWc2NEdGNiaUpkZlE9PSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9yZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydSZWFjdCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnUmVhY3QnXSA6IG51bGwpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIExhYmVsID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdMYWJlbCcsXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIF9wcm9wcyRsYWJlbCA9IHRoaXMucHJvcHMubGFiZWw7XG4gICAgdmFyIGxhYmVsID0gX3Byb3BzJGxhYmVsID09PSB1bmRlZmluZWQgPyAnJyA6IF9wcm9wcyRsYWJlbDtcblxuICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICdkaXYnLFxuICAgICAgbnVsbCxcbiAgICAgIGxhYmVsXG4gICAgKTtcbiAgfVxufSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IExhYmVsO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSWk5VmMyVnljeTlxZFhOMGFXNHZaMmwwTDJadmNtMWhkR2xqTDJ4cFlpOWpiMjF3YjI1bGJuUnpMMmhsYkhCbGNuTXZiR0ZpWld3dWFuTWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqczdPenM3T3pzN08zRkNRVUZyUWl4UFFVRlBPenM3TzBGQlJYcENMRWxCUVUwc1MwRkJTeXhIUVVGSExHMUNRVUZOTEZkQlFWY3NRMEZCUXpzN08wRkJSVGxDTEZGQlFVMHNSVUZCUVN4clFrRkJSenQxUWtGRFl5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRjRRaXhMUVVGTE8xRkJRVXdzUzBGQlN5eG5RMEZCUnl4RlFVRkZPenRCUVVWcVFpeFhRVU5GT3pzN1RVRkRSeXhMUVVGTE8wdEJRMFlzUTBGRFRqdEhRVU5JTzBOQlEwWXNRMEZCUXl4RFFVRkRPenR4UWtGRldTeExRVUZMSWl3aVptbHNaU0k2SW1kbGJtVnlZWFJsWkM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWelEyOXVkR1Z1ZENJNld5SnBiWEJ2Y25RZ1VtVmhZM1FnWm5KdmJTQW5jbVZoWTNRbk8xeHVYRzVqYjI1emRDQk1ZV0psYkNBOUlGSmxZV04wTG1OeVpXRjBaVU5zWVhOektIdGNibHh1SUNCeVpXNWtaWElvS1NCN1hHNGdJQ0FnWTI5dWMzUWdlMnhoWW1Wc0lEMGdKeWQ5SUQwZ2RHaHBjeTV3Y205d2N6dGNibHh1SUNBZ0lISmxkSFZ5YmlBb1hHNGdJQ0FnSUNBOFpHbDJQbHh1SUNBZ0lDQWdJQ0I3YkdGaVpXeDlYRzRnSUNBZ0lDQThMMlJwZGo1Y2JpQWdJQ0FwTzF4dUlDQjlYRzU5S1R0Y2JseHVaWGh3YjNKMElHUmxabUYxYkhRZ1RHRmlaV3c3WEc0aVhYMD0iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfcmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snUmVhY3QnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ1JlYWN0J10gOiBudWxsKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfdW5kYXNoID0gcmVxdWlyZSgnLi4vdW5kYXNoJyk7XG5cbnZhciBfdW5kYXNoMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3VuZGFzaCk7XG5cbnZhciBfd3JhcElucHV0ID0gcmVxdWlyZSgnLi93cmFwLWlucHV0Jyk7XG5cbnZhciBfd3JhcElucHV0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3dyYXBJbnB1dCk7XG5cbnZhciBfd3JhcFB1cmUgPSByZXF1aXJlKCcuL3dyYXAtcHVyZScpO1xuXG52YXIgX3dyYXBQdXJlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3dyYXBQdXJlKTtcblxudmFyIF93cmFwQ2hpbGRJbnB1dCA9IHJlcXVpcmUoJy4vd3JhcC1jaGlsZC1pbnB1dCcpO1xuXG52YXIgX3dyYXBDaGlsZElucHV0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3dyYXBDaGlsZElucHV0KTtcblxudmFyIF9jcmVhdGVGaWVsZCA9IHJlcXVpcmUoJy4vY3JlYXRlLWZpZWxkJyk7XG5cbnZhciBfY3JlYXRlRmllbGQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY3JlYXRlRmllbGQpO1xuXG52YXIgX3VzZUNvbnRleHQgPSByZXF1aXJlKCcuL3VzZS1jb250ZXh0Jyk7XG5cbnZhciBfdXNlQ29udGV4dDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF91c2VDb250ZXh0KTtcblxudmFyIF9pbnB1dHNTdHJpbmcgPSByZXF1aXJlKCcuL2lucHV0cy9zdHJpbmcnKTtcblxudmFyIF9pbnB1dHNTdHJpbmcyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaW5wdXRzU3RyaW5nKTtcblxudmFyIF9jb250YWluZXJzU3RyaW5nSW5wdXQgPSByZXF1aXJlKCcuL2NvbnRhaW5lcnMvc3RyaW5nLWlucHV0Jyk7XG5cbnZhciBfY29udGFpbmVyc1N0cmluZ0lucHV0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbnRhaW5lcnNTdHJpbmdJbnB1dCk7XG5cbnZhciBfY29udGFpbmVyc09iamVjdCA9IHJlcXVpcmUoJy4vY29udGFpbmVycy9vYmplY3QnKTtcblxudmFyIF9jb250YWluZXJzT2JqZWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbnRhaW5lcnNPYmplY3QpO1xuXG52YXIgX2hlbHBlcnNGaWVsZCA9IHJlcXVpcmUoJy4vaGVscGVycy9maWVsZCcpO1xuXG52YXIgX2hlbHBlcnNGaWVsZDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzRmllbGQpO1xuXG52YXIgX2hlbHBlcnNIZWxwID0gcmVxdWlyZSgnLi9oZWxwZXJzL2hlbHAnKTtcblxudmFyIF9oZWxwZXJzSGVscDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzSGVscCk7XG5cbnZhciBfaGVscGVyc0xhYmVsID0gcmVxdWlyZSgnLi9oZWxwZXJzL2xhYmVsJyk7XG5cbnZhciBfaGVscGVyc0xhYmVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNMYWJlbCk7XG5cbnZhciByYXdJbnB1dENvbXBvbmVudHMgPSB7XG4gIFN0cmluZ0lucHV0OiBfaW5wdXRzU3RyaW5nMlsnZGVmYXVsdCddLFxuICBTdHJpbmdJbnB1dENvbnRhaW5lcjogX2NvbnRhaW5lcnNTdHJpbmdJbnB1dDJbJ2RlZmF1bHQnXVxufTtcblxudmFyIGNvbXBvbmVudHMgPSB7XG4gIFdpdGhDb250ZXh0OiB7fVxufTtcblxudmFyIHVzZUNvbnRleHRQYXJhbSA9IHtcbiAgY29udGV4dFR5cGVzOiB7XG4gICAgb25DaGFuZ2VDaGlsZDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgY29tcG9uZW50czogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZFxuICB9LFxuICBjb250ZXh0VG9Qcm9wczogeyBvbkNoYW5nZUNoaWxkOiAnb25DaGFuZ2UnLCBjb21wb25lbnRzOiAnY29tcG9uZW50cycgfVxufTtcblxuT2JqZWN0LmtleXMocmF3SW5wdXRDb21wb25lbnRzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgdmFyIFJhd0lucHV0Q29tcG9uZW50ID0gcmF3SW5wdXRDb21wb25lbnRzW2tleV07XG4gIHZhciBQdXJlQ29tcG9uZW50ID0gKDAsIF93cmFwUHVyZTJbJ2RlZmF1bHQnXSkoUmF3SW5wdXRDb21wb25lbnQpO1xuICBQdXJlQ29tcG9uZW50Lmhhc0V2ZW50ID0gUmF3SW5wdXRDb21wb25lbnQuaGFzRXZlbnQ7XG4gIHZhciBJbnB1dENvbXBvbmVudCA9ICgwLCBfd3JhcElucHV0MlsnZGVmYXVsdCddKShQdXJlQ29tcG9uZW50KTtcbiAgY29tcG9uZW50c1trZXldID0gSW5wdXRDb21wb25lbnQ7XG4gIHZhciBDaGlsZElucHV0Q29tcG9uZW50ID0gKDAsIF93cmFwQ2hpbGRJbnB1dDJbJ2RlZmF1bHQnXSkoSW5wdXRDb21wb25lbnQpO1xuICBjb21wb25lbnRzWydDaGlsZCcgKyBrZXldID0gQ2hpbGRJbnB1dENvbXBvbmVudDtcbiAgY29tcG9uZW50cy5XaXRoQ29udGV4dFsnQ2hpbGQnICsga2V5XSA9ICgwLCBfdXNlQ29udGV4dDJbJ2RlZmF1bHQnXSkoQ2hpbGRJbnB1dENvbXBvbmVudCwgdXNlQ29udGV4dFBhcmFtKTtcbn0pO1xuXG52YXIgaW5wdXRUeXBlcyA9IFsnU3RyaW5nJ107XG5cbmlucHV0VHlwZXMuZm9yRWFjaChmdW5jdGlvbiAoaW5wdXRUeXBlKSB7XG4gIHZhciBJbnB1dENvbXBvbmVudCA9IGNvbXBvbmVudHNbaW5wdXRUeXBlICsgJ0lucHV0J107XG4gIHZhciBGaWVsZENvbXBvbmVudCA9ICgwLCBfY3JlYXRlRmllbGQyWydkZWZhdWx0J10pKElucHV0Q29tcG9uZW50KTtcbiAgY29tcG9uZW50c1tpbnB1dFR5cGUgKyAnRmllbGQnXSA9IEZpZWxkQ29tcG9uZW50O1xuICB2YXIgQ2hpbGRGaWVsZENvbXBvbmVudCA9ICgwLCBfd3JhcENoaWxkSW5wdXQyWydkZWZhdWx0J10pKEZpZWxkQ29tcG9uZW50KTtcbiAgY29tcG9uZW50c1snQ2hpbGQnICsgaW5wdXRUeXBlICsgJ0ZpZWxkJ10gPSBDaGlsZEZpZWxkQ29tcG9uZW50O1xuICBjb21wb25lbnRzLldpdGhDb250ZXh0WydDaGlsZCcgKyBpbnB1dFR5cGUgKyAnRmllbGQnXSA9ICgwLCBfdXNlQ29udGV4dDJbJ2RlZmF1bHQnXSkoQ2hpbGRGaWVsZENvbXBvbmVudCwgdXNlQ29udGV4dFBhcmFtKTtcbn0pO1xuXG5fdW5kYXNoMlsnZGVmYXVsdCddLmV4dGVuZChjb21wb25lbnRzLCB7XG4gIE9iamVjdENvbnRhaW5lcjogX2NvbnRhaW5lcnNPYmplY3QyWydkZWZhdWx0J10sXG4gIEZpZWxkOiBfaGVscGVyc0ZpZWxkMlsnZGVmYXVsdCddLFxuICBIZWxwOiBfaGVscGVyc0hlbHAyWydkZWZhdWx0J10sXG4gIExhYmVsOiBfaGVscGVyc0xhYmVsMlsnZGVmYXVsdCddXG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gY29tcG9uZW50cztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYklpOVZjMlZ5Y3k5cWRYTjBhVzR2WjJsMEwyWnZjbTFoZEdsakwyeHBZaTlqYjIxd2IyNWxiblJ6TDJsdVpHVjRMbXB6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUk3T3pzN096czdPenR4UWtGQmEwSXNUMEZCVHpzN096dHpRa0ZGV0N4WFFVRlhPenM3TzNsQ1FVTklMR05CUVdNN096czdkMEpCUTJZc1lVRkJZVHM3T3pzNFFrRkRVQ3h2UWtGQmIwSTdPenM3TWtKQlEzWkNMR2RDUVVGblFqczdPenN3UWtGRGFrSXNaVUZCWlRzN096czBRa0ZGWkN4cFFrRkJhVUk3T3pzN2NVTkJRMUlzTWtKQlFUSkNPenM3TzJkRFFVVm9ReXh4UWtGQmNVSTdPenM3TkVKQlJTOUNMR2xDUVVGcFFqczdPenN5UWtGRGJFSXNaMEpCUVdkQ096czdPelJDUVVObUxHbENRVUZwUWpzN096dEJRVVZ1UXl4SlFVRk5MR3RDUVVGclFpeEhRVUZITzBGQlEzcENMR0ZCUVZjc01rSkJRVUU3UVVGRFdDeHpRa0ZCYjBJc2IwTkJRVUU3UTBGRGNrSXNRMEZCUXpzN1FVRkZSaXhKUVVGTkxGVkJRVlVzUjBGQlJ6dEJRVU5xUWl4aFFVRlhMRVZCUVVVc1JVRkJSVHREUVVOb1FpeERRVUZET3p0QlFVVkdMRWxCUVUwc1pVRkJaU3hIUVVGSE8wRkJRM1JDTEdOQlFWa3NSVUZCUlR0QlFVTmFMR2xDUVVGaExFVkJRVVVzYlVKQlFVMHNVMEZCVXl4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVk8wRkJRemxETEdOQlFWVXNSVUZCUlN4dFFrRkJUU3hUUVVGVExFTkJRVU1zVFVGQlRTeERRVUZETEZWQlFWVTdSMEZET1VNN1FVRkRSQ3huUWtGQll5eEZRVUZGTEVWQlFVTXNZVUZCWVN4RlFVRkZMRlZCUVZVc1JVRkJSU3hWUVVGVkxFVkJRVVVzV1VGQldTeEZRVUZETzBOQlEzUkZMRU5CUVVNN08wRkJSVVlzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4clFrRkJhMElzUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4VlFVRkJMRWRCUVVjc1JVRkJTVHRCUVVNM1F5eE5RVUZOTEdsQ1FVRnBRaXhIUVVGSExHdENRVUZyUWl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8wRkJRMnhFTEUxQlFVMHNZVUZCWVN4SFFVRkhMREpDUVVGVExHbENRVUZwUWl4RFFVRkRMRU5CUVVNN1FVRkRiRVFzWlVGQllTeERRVUZETEZGQlFWRXNSMEZCUnl4cFFrRkJhVUlzUTBGQlF5eFJRVUZSTEVOQlFVTTdRVUZEY0VRc1RVRkJUU3hqUVVGakxFZEJRVWNzTkVKQlFWVXNZVUZCWVN4RFFVRkRMRU5CUVVNN1FVRkRhRVFzV1VGQlZTeERRVUZETEVkQlFVY3NRMEZCUXl4SFFVRkhMR05CUVdNc1EwRkJRenRCUVVOcVF5eE5RVUZOTEcxQ1FVRnRRaXhIUVVGSExHbERRVUZsTEdOQlFXTXNRMEZCUXl4RFFVRkRPMEZCUXpORUxGbEJRVlVzVjBGQlV5eEhRVUZITEVOQlFVY3NSMEZCUnl4dFFrRkJiVUlzUTBGQlF6dEJRVU5vUkN4WlFVRlZMRU5CUVVNc1YwRkJWeXhYUVVGVExFZEJRVWNzUTBGQlJ5eEhRVUZITERaQ1FVRlhMRzFDUVVGdFFpeEZRVUZGTEdWQlFXVXNRMEZCUXl4RFFVRkRPME5CUXpGR0xFTkJRVU1zUTBGQlF6czdRVUZGU0N4SlFVRk5MRlZCUVZVc1IwRkJSeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZET3p0QlFVVTVRaXhWUVVGVkxFTkJRVU1zVDBGQlR5eERRVUZETEZWQlFVRXNVMEZCVXl4RlFVRkpPMEZCUXpsQ0xFMUJRVTBzWTBGQll5eEhRVUZITEZWQlFWVXNRMEZCU1N4VFFVRlRMRmRCUVZFc1EwRkJRenRCUVVOMlJDeE5RVUZOTEdOQlFXTXNSMEZCUnl3NFFrRkJXU3hqUVVGakxFTkJRVU1zUTBGQlF6dEJRVU51UkN4WlFVRlZMRU5CUVVrc1UwRkJVeXhYUVVGUkxFZEJRVWNzWTBGQll5eERRVUZETzBGQlEycEVMRTFCUVUwc2JVSkJRVzFDTEVkQlFVY3NhVU5CUVdVc1kwRkJZeXhEUVVGRExFTkJRVU03UVVGRE0wUXNXVUZCVlN4WFFVRlRMRk5CUVZNc1YwRkJVU3hIUVVGSExHMUNRVUZ0UWl4RFFVRkRPMEZCUXpORUxGbEJRVlVzUTBGQlF5eFhRVUZYTEZkQlFWTXNVMEZCVXl4WFFVRlJMRWRCUVVjc05rSkJRVmNzYlVKQlFXMUNMRVZCUVVVc1pVRkJaU3hEUVVGRExFTkJRVU03UTBGRGNrY3NRMEZCUXl4RFFVRkRPenRCUVVWSUxHOUNRVUZGTEUxQlFVMHNRMEZCUXl4VlFVRlZMRVZCUVVVN1FVRkRia0lzYVVKQlFXVXNLMEpCUVVFN1FVRkRaaXhQUVVGTExESkNRVUZCTzBGQlEwd3NUVUZCU1N3d1FrRkJRVHRCUVVOS0xFOUJRVXNzTWtKQlFVRTdRMEZEVGl4RFFVRkRMRU5CUVVNN08zRkNRVVZaTEZWQlFWVWlMQ0ptYVd4bElqb2laMlZ1WlhKaGRHVmtMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE5EYjI1MFpXNTBJanBiSW1sdGNHOXlkQ0JTWldGamRDQm1jbTl0SUNkeVpXRmpkQ2M3WEc1Y2JtbHRjRzl5ZENCMUlHWnliMjBnSnk0dUwzVnVaR0Z6YUNjN1hHNXBiWEJ2Y25RZ2QzSmhjRWx1Y0hWMElHWnliMjBnSnk0dmQzSmhjQzFwYm5CMWRDYzdYRzVwYlhCdmNuUWdkM0poY0ZCMWNtVWdabkp2YlNBbkxpOTNjbUZ3TFhCMWNtVW5PMXh1YVcxd2IzSjBJSGR5WVhCRGFHbHNaRWx1Y0hWMElHWnliMjBnSnk0dmQzSmhjQzFqYUdsc1pDMXBibkIxZENjN1hHNXBiWEJ2Y25RZ1kzSmxZWFJsUm1sbGJHUWdabkp2YlNBbkxpOWpjbVZoZEdVdFptbGxiR1FuTzF4dWFXMXdiM0owSUhWelpVTnZiblJsZUhRZ1puSnZiU0FuTGk5MWMyVXRZMjl1ZEdWNGRDYzdYRzVjYm1sdGNHOXlkQ0JUZEhKcGJtZEpibkIxZENCbWNtOXRJQ2N1TDJsdWNIVjBjeTl6ZEhKcGJtY25PMXh1YVcxd2IzSjBJRk4wY21sdVowbHVjSFYwUTI5dWRHRnBibVZ5SUdaeWIyMGdKeTR2WTI5dWRHRnBibVZ5Y3k5emRISnBibWN0YVc1d2RYUW5PMXh1WEc1cGJYQnZjblFnVDJKcVpXTjBRMjl1ZEdGcGJtVnlJR1p5YjIwZ0p5NHZZMjl1ZEdGcGJtVnljeTl2WW1wbFkzUW5PMXh1WEc1cGJYQnZjblFnUm1sbGJHUWdabkp2YlNBbkxpOW9aV3h3WlhKekwyWnBaV3hrSnp0Y2JtbHRjRzl5ZENCSVpXeHdJR1p5YjIwZ0p5NHZhR1ZzY0dWeWN5OW9aV3h3Snp0Y2JtbHRjRzl5ZENCTVlXSmxiQ0JtY205dElDY3VMMmhsYkhCbGNuTXZiR0ZpWld3bk8xeHVYRzVqYjI1emRDQnlZWGRKYm5CMWRFTnZiWEJ2Ym1WdWRITWdQU0I3WEc0Z0lGTjBjbWx1WjBsdWNIVjBMRnh1SUNCVGRISnBibWRKYm5CMWRFTnZiblJoYVc1bGNseHVmVHRjYmx4dVkyOXVjM1FnWTI5dGNHOXVaVzUwY3lBOUlIdGNiaUFnVjJsMGFFTnZiblJsZUhRNklIdDlYRzU5TzF4dVhHNWpiMjV6ZENCMWMyVkRiMjUwWlhoMFVHRnlZVzBnUFNCN1hHNGdJR052Ym5SbGVIUlVlWEJsY3pvZ2UxeHVJQ0FnSUc5dVEyaGhibWRsUTJocGJHUTZJRkpsWVdOMExsQnliM0JVZVhCbGN5NW1kVzVqTG1selVtVnhkV2x5WldRc1hHNGdJQ0FnWTI5dGNHOXVaVzUwY3pvZ1VtVmhZM1F1VUhKdmNGUjVjR1Z6TG05aWFtVmpkQzVwYzFKbGNYVnBjbVZrWEc0Z0lIMHNYRzRnSUdOdmJuUmxlSFJVYjFCeWIzQnpPaUI3YjI1RGFHRnVaMlZEYUdsc1pEb2dKMjl1UTJoaGJtZGxKeXdnWTI5dGNHOXVaVzUwY3pvZ0oyTnZiWEJ2Ym1WdWRITW5mVnh1ZlR0Y2JseHVUMkpxWldOMExtdGxlWE1vY21GM1NXNXdkWFJEYjIxd2IyNWxiblJ6S1M1bWIzSkZZV05vS0d0bGVTQTlQaUI3WEc0Z0lHTnZibk4wSUZKaGQwbHVjSFYwUTI5dGNHOXVaVzUwSUQwZ2NtRjNTVzV3ZFhSRGIyMXdiMjVsYm5SelcydGxlVjA3WEc0Z0lHTnZibk4wSUZCMWNtVkRiMjF3YjI1bGJuUWdQU0IzY21Gd1VIVnlaU2hTWVhkSmJuQjFkRU52YlhCdmJtVnVkQ2s3WEc0Z0lGQjFjbVZEYjIxd2IyNWxiblF1YUdGelJYWmxiblFnUFNCU1lYZEpibkIxZEVOdmJYQnZibVZ1ZEM1b1lYTkZkbVZ1ZER0Y2JpQWdZMjl1YzNRZ1NXNXdkWFJEYjIxd2IyNWxiblFnUFNCM2NtRndTVzV3ZFhRb1VIVnlaVU52YlhCdmJtVnVkQ2s3WEc0Z0lHTnZiWEJ2Ym1WdWRITmJhMlY1WFNBOUlFbHVjSFYwUTI5dGNHOXVaVzUwTzF4dUlDQmpiMjV6ZENCRGFHbHNaRWx1Y0hWMFEyOXRjRzl1Wlc1MElEMGdkM0poY0VOb2FXeGtTVzV3ZFhRb1NXNXdkWFJEYjIxd2IyNWxiblFwTzF4dUlDQmpiMjF3YjI1bGJuUnpXMkJEYUdsc1pDUjdhMlY1ZldCZElEMGdRMmhwYkdSSmJuQjFkRU52YlhCdmJtVnVkRHRjYmlBZ1kyOXRjRzl1Wlc1MGN5NVhhWFJvUTI5dWRHVjRkRnRnUTJocGJHUWtlMnRsZVgxZ1hTQTlJSFZ6WlVOdmJuUmxlSFFvUTJocGJHUkpibkIxZEVOdmJYQnZibVZ1ZEN3Z2RYTmxRMjl1ZEdWNGRGQmhjbUZ0S1R0Y2JuMHBPMXh1WEc1amIyNXpkQ0JwYm5CMWRGUjVjR1Z6SUQwZ1d5ZFRkSEpwYm1jblhUdGNibHh1YVc1d2RYUlVlWEJsY3k1bWIzSkZZV05vS0dsdWNIVjBWSGx3WlNBOVBpQjdYRzRnSUdOdmJuTjBJRWx1Y0hWMFEyOXRjRzl1Wlc1MElEMGdZMjl0Y0c5dVpXNTBjMXRnSkh0cGJuQjFkRlI1Y0dWOVNXNXdkWFJnWFR0Y2JpQWdZMjl1YzNRZ1JtbGxiR1JEYjIxd2IyNWxiblFnUFNCamNtVmhkR1ZHYVdWc1pDaEpibkIxZEVOdmJYQnZibVZ1ZENrN1hHNGdJR052YlhCdmJtVnVkSE5iWUNSN2FXNXdkWFJVZVhCbGZVWnBaV3hrWUYwZ1BTQkdhV1ZzWkVOdmJYQnZibVZ1ZER0Y2JpQWdZMjl1YzNRZ1EyaHBiR1JHYVdWc1pFTnZiWEJ2Ym1WdWRDQTlJSGR5WVhCRGFHbHNaRWx1Y0hWMEtFWnBaV3hrUTI5dGNHOXVaVzUwS1R0Y2JpQWdZMjl0Y0c5dVpXNTBjMXRnUTJocGJHUWtlMmx1Y0hWMFZIbHdaWDFHYVdWc1pHQmRJRDBnUTJocGJHUkdhV1ZzWkVOdmJYQnZibVZ1ZER0Y2JpQWdZMjl0Y0c5dVpXNTBjeTVYYVhSb1EyOXVkR1Y0ZEZ0Z1EyaHBiR1FrZTJsdWNIVjBWSGx3WlgxR2FXVnNaR0JkSUQwZ2RYTmxRMjl1ZEdWNGRDaERhR2xzWkVacFpXeGtRMjl0Y0c5dVpXNTBMQ0IxYzJWRGIyNTBaWGgwVUdGeVlXMHBPMXh1ZlNrN1hHNWNiblV1WlhoMFpXNWtLR052YlhCdmJtVnVkSE1zSUh0Y2JpQWdUMkpxWldOMFEyOXVkR0ZwYm1WeUxGeHVJQ0JHYVdWc1pDeGNiaUFnU0dWc2NDeGNiaUFnVEdGaVpXeGNibjBwTzF4dVhHNWxlSEJ2Y25RZ1pHVm1ZWFZzZENCamIyMXdiMjVsYm5Sek8xeHVJbDE5IiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3JlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ1JlYWN0J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydSZWFjdCddIDogbnVsbCk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgU3RyaW5nSW5wdXQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ1N0cmluZ0lucHV0JyxcblxuICBzdGF0aWNzOiB7XG4gICAgaGFzRXZlbnQ6IHRydWVcbiAgfSxcblxuICBwcm9wVHlwZXM6IHtcbiAgICB2YWx1ZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBvbkNoYW5nZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWRcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICB2YXIgdmFsdWUgPSBfcHJvcHMudmFsdWU7XG4gICAgdmFyIG9uQ2hhbmdlID0gX3Byb3BzLm9uQ2hhbmdlO1xuICAgIHZhciBvbkZvY3VzID0gX3Byb3BzLm9uRm9jdXM7XG4gICAgdmFyIG9uQmx1ciA9IF9wcm9wcy5vbkJsdXI7XG5cbiAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJywgeyB2YWx1ZTogdmFsdWUsIG9uQ2hhbmdlOiBvbkNoYW5nZSwgb25Gb2N1czogb25Gb2N1cywgb25CbHVyOiBvbkJsdXIgfSk7XG4gIH1cbn0pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBTdHJpbmdJbnB1dDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYklpOVZjMlZ5Y3k5cWRYTjBhVzR2WjJsMEwyWnZjbTFoZEdsakwyeHBZaTlqYjIxd2IyNWxiblJ6TDJsdWNIVjBjeTl6ZEhKcGJtY3Vhbk1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanM3T3pzN096czdPM0ZDUVVGclFpeFBRVUZQT3pzN08wRkJSWHBDTEVsQlFVMHNWMEZCVnl4SFFVRkhMRzFDUVVGTkxGZEJRVmNzUTBGQlF6czdPMEZCUlhCRExGTkJRVThzUlVGQlJUdEJRVU5RTEZsQlFWRXNSVUZCUlN4SlFVRkpPMGRCUTJZN08wRkJSVVFzVjBGQlV5eEZRVUZGTzBGQlExUXNVMEZCU3l4RlFVRkZMRzFDUVVGTkxGTkJRVk1zUTBGQlF5eE5RVUZOTEVOQlFVTXNWVUZCVlR0QlFVTjRReXhaUVVGUkxFVkJRVVVzYlVKQlFVMHNVMEZCVXl4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVk8wZEJRekZET3p0QlFVVkVMRkZCUVUwc1JVRkJRU3hyUWtGQlJ6dHBRa0ZEYjBNc1NVRkJTU3hEUVVGRExFdEJRVXM3VVVGQk9VTXNTMEZCU3l4VlFVRk1MRXRCUVVzN1VVRkJSU3hSUVVGUkxGVkJRVklzVVVGQlVUdFJRVUZGTEU5QlFVOHNWVUZCVUN4UFFVRlBPMUZCUVVVc1RVRkJUU3hWUVVGT0xFMUJRVTA3TzBGQlEzWkRMRmRCUVU4c0swTkJRVlVzUzBGQlN5eEZRVUZGTEV0QlFVc3NRVUZCUXl4RlFVRkRMRkZCUVZFc1JVRkJSU3hSUVVGUkxFRkJRVU1zUlVGQlF5eFBRVUZQTEVWQlFVVXNUMEZCVHl4QlFVRkRMRVZCUVVNc1RVRkJUU3hGUVVGRkxFMUJRVTBzUVVGQlF5eEhRVUZGTEVOQlFVTTdSMEZEZUVZN1EwRkRSaXhEUVVGRExFTkJRVU03TzNGQ1FVVlpMRmRCUVZjaUxDSm1hV3hsSWpvaVoyVnVaWEpoZEdWa0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTkRiMjUwWlc1MElqcGJJbWx0Y0c5eWRDQlNaV0ZqZENCbWNtOXRJQ2R5WldGamRDYzdYRzVjYm1OdmJuTjBJRk4wY21sdVowbHVjSFYwSUQwZ1VtVmhZM1F1WTNKbFlYUmxRMnhoYzNNb2UxeHVYRzRnSUhOMFlYUnBZM002SUh0Y2JpQWdJQ0JvWVhORmRtVnVkRG9nZEhKMVpWeHVJQ0I5TEZ4dVhHNGdJSEJ5YjNCVWVYQmxjem9nZTF4dUlDQWdJSFpoYkhWbE9pQlNaV0ZqZEM1UWNtOXdWSGx3WlhNdWMzUnlhVzVuTG1selVtVnhkV2x5WldRc1hHNGdJQ0FnYjI1RGFHRnVaMlU2SUZKbFlXTjBMbEJ5YjNCVWVYQmxjeTVtZFc1akxtbHpVbVZ4ZFdseVpXUmNiaUFnZlN4Y2JseHVJQ0J5Wlc1a1pYSW9LU0I3WEc0Z0lDQWdZMjl1YzNRZ2UzWmhiSFZsTENCdmJrTm9ZVzVuWlN3Z2IyNUdiMk4xY3l3Z2IyNUNiSFZ5ZlNBOUlIUm9hWE11Y0hKdmNITTdYRzRnSUNBZ2NtVjBkWEp1SUR4MFpYaDBZWEpsWVNCMllXeDFaVDE3ZG1Gc2RXVjlJRzl1UTJoaGJtZGxQWHR2YmtOb1lXNW5aWDBnYjI1R2IyTjFjejE3YjI1R2IyTjFjMzBnYjI1Q2JIVnlQWHR2YmtKc2RYSjlMejQ3WEc0Z0lIMWNibjBwTzF4dVhHNWxlSEJ2Y25RZ1pHVm1ZWFZzZENCVGRISnBibWRKYm5CMWREdGNiaUpkZlE9PSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9yZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydSZWFjdCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnUmVhY3QnXSA6IG51bGwpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF91bmRhc2ggPSByZXF1aXJlKCcuLi91bmRhc2gnKTtcblxudmFyIF91bmRhc2gyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdW5kYXNoKTtcblxudmFyIHVzZUNvbnRleHQgPSBmdW5jdGlvbiB1c2VDb250ZXh0KENvbXBvbmVudCkge1xuICB2YXIgX3JlZiA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gIHZhciBfcmVmJGNvbnRleHRUeXBlcyA9IF9yZWYuY29udGV4dFR5cGVzO1xuICB2YXIgY29udGV4dFR5cGVzID0gX3JlZiRjb250ZXh0VHlwZXMgPT09IHVuZGVmaW5lZCA/IHt9IDogX3JlZiRjb250ZXh0VHlwZXM7XG4gIHZhciBfcmVmJGNvbnRleHRUb1Byb3BzID0gX3JlZi5jb250ZXh0VG9Qcm9wcztcbiAgdmFyIGNvbnRleHRUb1Byb3BzID0gX3JlZiRjb250ZXh0VG9Qcm9wcyA9PT0gdW5kZWZpbmVkID8ge30gOiBfcmVmJGNvbnRleHRUb1Byb3BzO1xuXG4gIHZhciBVc2VDb250ZXh0ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1VzZUNvbnRleHQnLFxuXG4gICAgY29udGV4dFR5cGVzOiBjb250ZXh0VHlwZXMsXG5cbiAgICBwcm9wc0Zyb21Db250ZXh0OiBmdW5jdGlvbiBwcm9wc0Zyb21Db250ZXh0KCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgdmFyIHBhaXJzID0gT2JqZWN0LmtleXMoY29udGV4dFRvUHJvcHMpLm1hcChmdW5jdGlvbiAoY29udGV4dEtleSkge1xuICAgICAgICB2YXIgcHJvcEtleSA9IGNvbnRleHRUb1Byb3BzW2NvbnRleHRLZXldO1xuICAgICAgICByZXR1cm4gW3Byb3BLZXksIF90aGlzLmNvbnRleHRbY29udGV4dEtleV1dO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gX3VuZGFzaDJbJ2RlZmF1bHQnXS5vYmplY3QocGFpcnMpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChDb21wb25lbnQsIF9leHRlbmRzKHt9LCB0aGlzLnByb3BzLCB0aGlzLnByb3BzRnJvbUNvbnRleHQoKSkpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFVzZUNvbnRleHQ7XG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSB1c2VDb250ZXh0O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSWk5VmMyVnljeTlxZFhOMGFXNHZaMmwwTDJadmNtMWhkR2xqTDJ4cFlpOWpiMjF3YjI1bGJuUnpMM1Z6WlMxamIyNTBaWGgwTG1weklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lJN096czdPenM3T3pzN08zRkNRVUZyUWl4UFFVRlBPenM3TzNOQ1FVTllMRmRCUVZjN096czdRVUZGZWtJc1NVRkJUU3hWUVVGVkxFZEJRVWNzVTBGQllpeFZRVUZWTEVOQlFVa3NVMEZCVXl4RlFVRnZSRHR0UlVGQlVDeEZRVUZGT3pzclFrRkJOVU1zV1VGQldUdE5RVUZhTEZsQlFWa3NjVU5CUVVjc1JVRkJSVHRwUTBGQlJTeGpRVUZqTzAxQlFXUXNZMEZCWXl4MVEwRkJSeXhGUVVGRk96dEJRVVZ3UlN4TlFVRk5MRlZCUVZVc1IwRkJSeXh0UWtGQlRTeFhRVUZYTEVOQlFVTTdPenRCUVVWdVF5eG5Ra0ZCV1N4RlFVRmFMRmxCUVZrN08wRkJSVm9zYjBKQlFXZENMRVZCUVVFc05FSkJRVWM3T3p0QlFVTnFRaXhWUVVGTkxFdEJRVXNzUjBGQlJ5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMR05CUVdNc1EwRkJReXhEUVVGRExFZEJRVWNzUTBGQlF5eFZRVUZCTEZWQlFWVXNSVUZCU1R0QlFVTXhSQ3haUVVGTkxFOUJRVThzUjBGQlJ5eGpRVUZqTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNN1FVRkRNME1zWlVGQlR5eERRVUZETEU5QlFVOHNSVUZCUlN4TlFVRkxMRTlCUVU4c1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF5eERRVUZETzA5QlF6VkRMRU5CUVVNc1EwRkJRenRCUVVOSUxHRkJRVThzYjBKQlFVVXNUVUZCVFN4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRE8wdEJRM2hDT3p0QlFVVkVMRlZCUVUwc1JVRkJRU3hyUWtGQlJ6dEJRVU5RTEdGQlFVOHNhVU5CUVVNc1UwRkJVeXhsUVVGTExFbEJRVWtzUTBGQlF5eExRVUZMTEVWQlFVMHNTVUZCU1N4RFFVRkRMR2RDUVVGblFpeEZRVUZGTEVWQlFVY3NRMEZCUXp0TFFVTnNSVHRIUVVOR0xFTkJRVU1zUTBGQlF6czdRVUZGU0N4VFFVRlBMRlZCUVZVc1EwRkJRenREUVVOdVFpeERRVUZET3p0eFFrRkZZU3hWUVVGVklpd2labWxzWlNJNkltZGxibVZ5WVhSbFpDNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpRMjl1ZEdWdWRDSTZXeUpwYlhCdmNuUWdVbVZoWTNRZ1puSnZiU0FuY21WaFkzUW5PMXh1YVcxd2IzSjBJSFVnWm5KdmJTQW5MaTR2ZFc1a1lYTm9KenRjYmx4dVkyOXVjM1FnZFhObFEyOXVkR1Y0ZENBOUlDaERiMjF3YjI1bGJuUXNJSHRqYjI1MFpYaDBWSGx3WlhNZ1BTQjdmU3dnWTI5dWRHVjRkRlJ2VUhKdmNITWdQU0I3ZlgwZ1BTQjdmU2tnUFQ0Z2UxeHVYRzRnSUdOdmJuTjBJRlZ6WlVOdmJuUmxlSFFnUFNCU1pXRmpkQzVqY21WaGRHVkRiR0Z6Y3loN1hHNWNiaUFnSUNCamIyNTBaWGgwVkhsd1pYTXNYRzVjYmlBZ0lDQndjbTl3YzBaeWIyMURiMjUwWlhoMEtDa2dlMXh1SUNBZ0lDQWdZMjl1YzNRZ2NHRnBjbk1nUFNCUFltcGxZM1F1YTJWNWN5aGpiMjUwWlhoMFZHOVFjbTl3Y3lrdWJXRndLR052Ym5SbGVIUkxaWGtnUFQ0Z2UxeHVJQ0FnSUNBZ0lDQmpiMjV6ZENCd2NtOXdTMlY1SUQwZ1kyOXVkR1Y0ZEZSdlVISnZjSE5iWTI5dWRHVjRkRXRsZVYwN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCYmNISnZjRXRsZVN3Z2RHaHBjeTVqYjI1MFpYaDBXMk52Ym5SbGVIUkxaWGxkWFR0Y2JpQWdJQ0FnSUgwcE8xeHVJQ0FnSUNBZ2NtVjBkWEp1SUhVdWIySnFaV04wS0hCaGFYSnpLVHRjYmlBZ0lDQjlMRnh1WEc0Z0lDQWdjbVZ1WkdWeUtDa2dlMXh1SUNBZ0lDQWdjbVYwZFhKdUlEeERiMjF3YjI1bGJuUWdleTR1TG5Sb2FYTXVjSEp2Y0hOOUlIc3VMaTUwYUdsekxuQnliM0J6Um5KdmJVTnZiblJsZUhRb0tYMHZQanRjYmlBZ0lDQjlYRzRnSUgwcE8xeHVYRzRnSUhKbGRIVnliaUJWYzJWRGIyNTBaWGgwTzF4dWZUdGNibHh1Wlhod2IzSjBJR1JsWm1GMWJIUWdkWE5sUTI5dWRHVjRkRHRjYmlKZGZRPT0iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhvYmosIGtleXMpIHsgdmFyIHRhcmdldCA9IHt9OyBmb3IgKHZhciBpIGluIG9iaikgeyBpZiAoa2V5cy5pbmRleE9mKGkpID49IDApIGNvbnRpbnVlOyBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGkpKSBjb250aW51ZTsgdGFyZ2V0W2ldID0gb2JqW2ldOyB9IHJldHVybiB0YXJnZXQ7IH1cblxudmFyIF9yZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydSZWFjdCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnUmVhY3QnXSA6IG51bGwpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF91bmRhc2ggPSByZXF1aXJlKCcuLi91bmRhc2gnKTtcblxudmFyIF91bmRhc2gyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdW5kYXNoKTtcblxudmFyIHdyYXBDaGlsZElucHV0ID0gZnVuY3Rpb24gd3JhcENoaWxkSW5wdXQoSW5wdXQpIHtcbiAgdmFyIF9yZWYgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1sxXTtcblxuICB2YXIgX3JlZiRkZWZhdWx0VmFsdWUgPSBfcmVmLmRlZmF1bHRWYWx1ZTtcbiAgdmFyIGRlZmF1bHRWYWx1ZSA9IF9yZWYkZGVmYXVsdFZhbHVlID09PSB1bmRlZmluZWQgPyAnJyA6IF9yZWYkZGVmYXVsdFZhbHVlO1xuXG4gIHZhciBXcmFwQ2hpbGRJbnB1dCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdXcmFwQ2hpbGRJbnB1dCcsXG5cbiAgICBtaXhpbnM6IFtfcmVhY3QyWydkZWZhdWx0J10uUHVyZVJlbmRlck1peGluXSxcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgcGFyZW50VmFsdWU6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICBjaGlsZEtleTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgIG9uQ2hhbmdlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZFxuICAgIH0sXG5cbiAgICBjaGlsZFZhbHVlOiBmdW5jdGlvbiBjaGlsZFZhbHVlKCkge1xuICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICB2YXIgcGFyZW50VmFsdWUgPSBfcHJvcHMucGFyZW50VmFsdWU7XG4gICAgICB2YXIgY2hpbGRLZXkgPSBfcHJvcHMuY2hpbGRLZXk7XG5cbiAgICAgIHZhciBjaGlsZFZhbHVlID0gcGFyZW50VmFsdWVbY2hpbGRLZXldO1xuICAgICAgaWYgKF91bmRhc2gyWydkZWZhdWx0J10uaXNVbmRlZmluZWQoY2hpbGRWYWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGlsZFZhbHVlO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gb25DaGFuZ2UobmV3VmFsdWUpIHtcbiAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgIHZhciBvbkNoYW5nZSA9IF9wcm9wczIub25DaGFuZ2U7XG4gICAgICB2YXIgY2hpbGRLZXkgPSBfcHJvcHMyLmNoaWxkS2V5O1xuXG4gICAgICBvbkNoYW5nZShuZXdWYWx1ZSwge1xuICAgICAgICBwYXRoOiBbY2hpbGRLZXldXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICB2YXIgY2hpbGRWYWx1ZSA9IHRoaXMuY2hpbGRWYWx1ZTtcbiAgICAgIHZhciBvbkNoYW5nZSA9IHRoaXMub25DaGFuZ2U7XG5cbiAgICAgIHZhciB2YWx1ZSA9IGNoaWxkVmFsdWUoKTtcbiAgICAgIHZhciBfcHJvcHMzID0gdGhpcy5wcm9wcztcbiAgICAgIHZhciBwYXJlbnRLZXkgPSBfcHJvcHMzLnBhcmVudEtleTtcbiAgICAgIHZhciBjaGlsZEtleSA9IF9wcm9wczMuY2hpbGRLZXk7XG5cbiAgICAgIHZhciBwcm9wcyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhfcHJvcHMzLCBbJ3BhcmVudEtleScsICdjaGlsZEtleSddKTtcblxuICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KElucHV0LCBfZXh0ZW5kcyh7fSwgcHJvcHMsIHsgdmFsdWU6IHZhbHVlLCBvbkNoYW5nZTogb25DaGFuZ2UgfSkpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFdyYXBDaGlsZElucHV0O1xufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gd3JhcENoaWxkSW5wdXQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJaTlWYzJWeWN5OXFkWE4wYVc0dloybDBMMlp2Y20xaGRHbGpMMnhwWWk5amIyMXdiMjVsYm5SekwzZHlZWEF0WTJocGJHUXRhVzV3ZFhRdWFuTWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqczdPenM3T3pzN096czdPenR4UWtGQmEwSXNUMEZCVHpzN096dHpRa0ZEV0N4WFFVRlhPenM3TzBGQlJYcENMRWxCUVUwc1kwRkJZeXhIUVVGSExGTkJRV3BDTEdOQlFXTXNRMEZCU1N4TFFVRkxMRVZCUVN0Q08yMUZRVUZRTEVWQlFVVTdPeXRDUVVGMlFpeFpRVUZaTzAxQlFWb3NXVUZCV1N4eFEwRkJSeXhGUVVGRk96dEJRVVV2UXl4TlFVRk5MR05CUVdNc1IwRkJSeXh0UWtGQlRTeFhRVUZYTEVOQlFVTTdPenRCUVVWMlF5eFZRVUZOTEVWQlFVVXNRMEZCUXl4dFFrRkJUU3hsUVVGbExFTkJRVU03TzBGQlJTOUNMR0ZCUVZNc1JVRkJSVHRCUVVOVUxHbENRVUZYTEVWQlFVVXNiVUpCUVUwc1UwRkJVeXhEUVVGRExFMUJRVTBzUTBGQlF5eFZRVUZWTzBGQlF6bERMR05CUVZFc1JVRkJSU3h0UWtGQlRTeFRRVUZUTEVOQlFVTXNUVUZCVFN4RFFVRkRMRlZCUVZVN1FVRkRNME1zWTBGQlVTeEZRVUZGTEcxQ1FVRk5MRk5CUVZNc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlZUdExRVU14UXpzN1FVRkZSQ3hqUVVGVkxFVkJRVUVzYzBKQlFVYzdiVUpCUTNGQ0xFbEJRVWtzUTBGQlF5eExRVUZMTzFWQlFXNURMRmRCUVZjc1ZVRkJXQ3hYUVVGWE8xVkJRVVVzVVVGQlVTeFZRVUZTTEZGQlFWRTdPMEZCUXpWQ0xGVkJRVTBzVlVGQlZTeEhRVUZITEZkQlFWY3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenRCUVVONlF5eFZRVUZKTEc5Q1FVRkZMRmRCUVZjc1EwRkJReXhWUVVGVkxFTkJRVU1zUlVGQlJUdEJRVU0zUWl4bFFVRlBMRmxCUVZrc1EwRkJRenRQUVVOeVFqdEJRVU5FTEdGQlFVOHNWVUZCVlN4RFFVRkRPMHRCUTI1Q096dEJRVVZFTEZsQlFWRXNSVUZCUVN4clFrRkJReXhSUVVGUkxFVkJRVVU3YjBKQlExa3NTVUZCU1N4RFFVRkRMRXRCUVVzN1ZVRkJhRU1zVVVGQlVTeFhRVUZTTEZGQlFWRTdWVUZCUlN4UlFVRlJMRmRCUVZJc1VVRkJVVHM3UVVGRGVrSXNZMEZCVVN4RFFVRkRMRkZCUVZFc1JVRkJSVHRCUVVOcVFpeFpRVUZKTEVWQlFVVXNRMEZCUXl4UlFVRlJMRU5CUVVNN1QwRkRha0lzUTBGQlF5eERRVUZETzB0QlEwbzdPMEZCUlVRc1ZVRkJUU3hGUVVGQkxHdENRVUZITzFWQlEwRXNWVUZCVlN4SFFVRmpMRWxCUVVrc1EwRkJOVUlzVlVGQlZUdFZRVUZGTEZGQlFWRXNSMEZCU1N4SlFVRkpMRU5CUVdoQ0xGRkJRVkU3TzBGQlF6TkNMRlZCUVUwc1MwRkJTeXhIUVVGSExGVkJRVlVzUlVGQlJTeERRVUZETzI5Q1FVTmhMRWxCUVVrc1EwRkJReXhMUVVGTE8xVkJRVE5ETEZOQlFWTXNWMEZCVkN4VFFVRlRPMVZCUVVVc1VVRkJVU3hYUVVGU0xGRkJRVkU3TzFWQlFVc3NTMEZCU3pzN1FVRkRjRU1zWVVGQlR5eHBRMEZCUXl4TFFVRkxMR1ZCUVVzc1MwRkJTeXhKUVVGRkxFdEJRVXNzUlVGQlJTeExRVUZMTEVGQlFVTXNSVUZCUXl4UlFVRlJMRVZCUVVVc1VVRkJVU3hCUVVGRExFbEJRVVVzUTBGQlF6dExRVU01UkR0SFFVTkdMRU5CUVVNc1EwRkJRenM3UVVGRlNDeFRRVUZQTEdOQlFXTXNRMEZCUXp0RFFVTjJRaXhEUVVGRE96dHhRa0ZGWVN4alFVRmpJaXdpWm1sc1pTSTZJbWRsYm1WeVlYUmxaQzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2V3lKcGJYQnZjblFnVW1WaFkzUWdabkp2YlNBbmNtVmhZM1FuTzF4dWFXMXdiM0owSUhVZ1puSnZiU0FuTGk0dmRXNWtZWE5vSnp0Y2JseHVZMjl1YzNRZ2QzSmhjRU5vYVd4a1NXNXdkWFFnUFNBb1NXNXdkWFFzSUh0a1pXWmhkV3gwVm1Gc2RXVWdQU0FuSjMwZ1BTQjdmU2tnUFQ0Z2UxeHVYRzRnSUdOdmJuTjBJRmR5WVhCRGFHbHNaRWx1Y0hWMElEMGdVbVZoWTNRdVkzSmxZWFJsUTJ4aGMzTW9lMXh1WEc0Z0lDQWdiV2w0YVc1ek9pQmJVbVZoWTNRdVVIVnlaVkpsYm1SbGNrMXBlR2x1WFN4Y2JseHVJQ0FnSUhCeWIzQlVlWEJsY3pvZ2UxeHVJQ0FnSUNBZ2NHRnlaVzUwVm1Gc2RXVTZJRkpsWVdOMExsQnliM0JVZVhCbGN5NXZZbXBsWTNRdWFYTlNaWEYxYVhKbFpDeGNiaUFnSUNBZ0lHTm9hV3hrUzJWNU9pQlNaV0ZqZEM1UWNtOXdWSGx3WlhNdWMzUnlhVzVuTG1selVtVnhkV2x5WldRc1hHNGdJQ0FnSUNCdmJrTm9ZVzVuWlRvZ1VtVmhZM1F1VUhKdmNGUjVjR1Z6TG1aMWJtTXVhWE5TWlhGMWFYSmxaRnh1SUNBZ0lIMHNYRzVjYmlBZ0lDQmphR2xzWkZaaGJIVmxLQ2tnZTF4dUlDQWdJQ0FnWTI5dWMzUWdlM0JoY21WdWRGWmhiSFZsTENCamFHbHNaRXRsZVgwZ1BTQjBhR2x6TG5CeWIzQnpPMXh1SUNBZ0lDQWdZMjl1YzNRZ1kyaHBiR1JXWVd4MVpTQTlJSEJoY21WdWRGWmhiSFZsVzJOb2FXeGtTMlY1WFR0Y2JpQWdJQ0FnSUdsbUlDaDFMbWx6Vlc1a1pXWnBibVZrS0dOb2FXeGtWbUZzZFdVcEtTQjdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQmtaV1poZFd4MFZtRnNkV1U3WEc0Z0lDQWdJQ0I5WEc0Z0lDQWdJQ0J5WlhSMWNtNGdZMmhwYkdSV1lXeDFaVHRjYmlBZ0lDQjlMRnh1WEc0Z0lDQWdiMjVEYUdGdVoyVW9ibVYzVm1Gc2RXVXBJSHRjYmlBZ0lDQWdJR052Ym5OMElIdHZia05vWVc1blpTd2dZMmhwYkdSTFpYbDlJRDBnZEdocGN5NXdjbTl3Y3p0Y2JpQWdJQ0FnSUc5dVEyaGhibWRsS0c1bGQxWmhiSFZsTENCN1hHNGdJQ0FnSUNBZ0lIQmhkR2c2SUZ0amFHbHNaRXRsZVYxY2JpQWdJQ0FnSUgwcE8xeHVJQ0FnSUgwc1hHNWNiaUFnSUNCeVpXNWtaWElvS1NCN1hHNGdJQ0FnSUNCamIyNXpkQ0I3WTJocGJHUldZV3gxWlN3Z2IyNURhR0Z1WjJWOUlEMGdkR2hwY3p0Y2JpQWdJQ0FnSUdOdmJuTjBJSFpoYkhWbElEMGdZMmhwYkdSV1lXeDFaU2dwTzF4dUlDQWdJQ0FnWTI5dWMzUWdlM0JoY21WdWRFdGxlU3dnWTJocGJHUkxaWGtzSUM0dUxuQnliM0J6ZlNBOUlIUm9hWE11Y0hKdmNITTdYRzRnSUNBZ0lDQnlaWFIxY200Z1BFbHVjSFYwSUhzdUxpNXdjbTl3YzMwZ2RtRnNkV1U5ZTNaaGJIVmxmU0J2YmtOb1lXNW5aVDE3YjI1RGFHRnVaMlY5THo0N1hHNGdJQ0FnZlZ4dUlDQjlLVHRjYmx4dUlDQnlaWFIxY200Z1YzSmhjRU5vYVd4a1NXNXdkWFE3WEc1OU8xeHVYRzVsZUhCdmNuUWdaR1ZtWVhWc2RDQjNjbUZ3UTJocGJHUkpibkIxZER0Y2JpSmRmUT09IiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gd3JhcElucHV0O1xuXG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMob2JqLCBrZXlzKSB7IHZhciB0YXJnZXQgPSB7fTsgZm9yICh2YXIgaSBpbiBvYmopIHsgaWYgKGtleXMuaW5kZXhPZihpKSA+PSAwKSBjb250aW51ZTsgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBpKSkgY29udGludWU7IHRhcmdldFtpXSA9IG9ialtpXTsgfSByZXR1cm4gdGFyZ2V0OyB9XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydSZWFjdCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnUmVhY3QnXSA6IG51bGwpO1xudmFyIHUgPSByZXF1aXJlKCcuLi91bmRhc2gnKTtcblxuZnVuY3Rpb24gd3JhcElucHV0KElucHV0Q29tcG9uZW50KSB7XG5cbiAgdmFyIFdyYXBJbnB1dCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1dyYXBJbnB1dCcsXG5cbiAgICBtaXhpbnM6IFtSZWFjdC5QdXJlUmVuZGVyTWl4aW5dLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpc0NvbnRyb2xsZWQ6ICF1LmlzVW5kZWZpbmVkKHRoaXMucHJvcHMudmFsdWUpLFxuICAgICAgICB2YWx1ZTogdS5pc1VuZGVmaW5lZCh0aGlzLnByb3BzLnZhbHVlKSA/IHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlIDogdGhpcy5wcm9wcy52YWx1ZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wcykge1xuICAgICAgaWYgKHRoaXMuc3RhdGUuaXNDb250cm9sbGVkKSB7XG4gICAgICAgIGlmICghdS5pc1VuZGVmaW5lZChuZXdQcm9wcy52YWx1ZSkpIHtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHZhbHVlOiBuZXdQcm9wcy52YWx1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiBvbkNoYW5nZShuZXdWYWx1ZSwgaW5mbykge1xuXG4gICAgICBpZiAoSW5wdXRDb21wb25lbnQuaGFzRXZlbnQgfHwgdGhpcy5wcm9wcy5oYXNFdmVudCkge1xuICAgICAgICB2YXIgX2V2ZW50ID0gbmV3VmFsdWU7XG4gICAgICAgIG5ld1ZhbHVlID0gX2V2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLnN0YXRlLmlzQ29udHJvbGxlZCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICB2YWx1ZTogbmV3VmFsdWVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICB2YXIgaGFzRXZlbnQgPSBfcHJvcHMuaGFzRXZlbnQ7XG5cbiAgICAgIHZhciBwcm9wcyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhfcHJvcHMsIFsnaGFzRXZlbnQnXSk7XG5cbiAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KElucHV0Q29tcG9uZW50LCBfZXh0ZW5kcyh7fSwgcHJvcHMsIHtcbiAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUudmFsdWUsXG4gICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlXG4gICAgICB9KSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gV3JhcElucHV0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJaTlWYzJWeWN5OXFkWE4wYVc0dloybDBMMlp2Y20xaGRHbGpMMnhwWWk5amIyMXdiMjVsYm5SekwzZHlZWEF0YVc1d2RYUXVhbk1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanM3T3pzN096czdPM0ZDUVVkM1FpeFRRVUZUT3pzN08wRkJTR3BETEVsQlFVMHNTMEZCU3l4SFFVRkhMRTlCUVU4c1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF6dEJRVU12UWl4SlFVRk5MRU5CUVVNc1IwRkJSeXhQUVVGUExFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTTdPMEZCUldoQ0xGTkJRVk1zVTBGQlV5eERRVUZETEdOQlFXTXNSVUZCUlRzN1FVRkZhRVFzVFVGQlRTeFRRVUZUTEVkQlFVY3NTMEZCU3l4RFFVRkRMRmRCUVZjc1EwRkJRenM3TzBGQlJXeERMRlZCUVUwc1JVRkJSU3hEUVVGRExFdEJRVXNzUTBGQlF5eGxRVUZsTEVOQlFVTTdPMEZCUlM5Q0xHMUNRVUZsTEVWQlFVRXNNa0pCUVVjN1FVRkRhRUlzWVVGQlR6dEJRVU5NTEc5Q1FVRlpMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zVjBGQlZ5eERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRE8wRkJRemxETEdGQlFVc3NSVUZCUlN4RFFVRkRMRU5CUVVNc1YwRkJWeXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eFpRVUZaTEVkQlFVY3NTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhMUVVGTE8wOUJRM0JHTEVOQlFVTTdTMEZEU0RzN1FVRkZSQ3cyUWtGQmVVSXNSVUZCUXl4dFEwRkJReXhSUVVGUkxFVkJRVVU3UVVGRGJrTXNWVUZCU1N4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExGbEJRVmtzUlVGQlJUdEJRVU16UWl4WlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExGZEJRVmNzUTBGQlF5eFJRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRVZCUVVVN1FVRkRiRU1zWTBGQlNTeERRVUZETEZGQlFWRXNRMEZCUXp0QlFVTmFMR2xDUVVGTExFVkJRVVVzVVVGQlVTeERRVUZETEV0QlFVczdWMEZEZEVJc1EwRkJReXhEUVVGRE8xTkJRMG83VDBGRFJqdExRVU5HT3p0QlFVVkVMRmxCUVZFc1JVRkJReXhyUWtGQlF5eFJRVUZSTEVWQlFVVXNTVUZCU1N4RlFVRkZPenRCUVVWNFFpeFZRVUZKTEdOQlFXTXNRMEZCUXl4UlFVRlJMRWxCUVVrc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eFJRVUZSTEVWQlFVVTdRVUZEYkVRc1dVRkJUU3hOUVVGTExFZEJRVWNzVVVGQlVTeERRVUZETzBGQlEzWkNMR2RDUVVGUkxFZEJRVWNzVFVGQlN5eERRVUZETEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNN1QwRkRMMEk3TzBGQlJVUXNWVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zV1VGQldTeEZRVUZGTzBGQlF6VkNMRmxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU03UVVGRFdpeGxRVUZMTEVWQlFVVXNVVUZCVVR0VFFVTm9RaXhEUVVGRExFTkJRVU03VDBGRFNqdEJRVU5FTEZWQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExGRkJRVkVzUlVGQlJUdEJRVU40UWl4bFFVRlBPMDlCUTFJN1FVRkRSQ3hWUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEZGQlFWRXNRMEZCUXl4UlFVRlJMRVZCUVVVc1NVRkJTU3hEUVVGRExFTkJRVU03UzBGRGNrTTdPMEZCUlVRc1ZVRkJUU3hGUVVGQkxHdENRVUZITzIxQ1FVTnpRaXhKUVVGSkxFTkJRVU1zUzBGQlN6dFZRVUZvUXl4UlFVRlJMRlZCUVZJc1VVRkJVVHM3VlVGQlN5eExRVUZMT3p0QlFVVjZRaXhoUVVGUExHOUNRVUZETEdOQlFXTXNaVUZCU3l4TFFVRkxPMEZCUXpsQ0xHRkJRVXNzUlVGQlJTeEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1FVRkJRenRCUVVONFFpeG5Ra0ZCVVN4RlFVRkZMRWxCUVVrc1EwRkJReXhSUVVGUkxFRkJRVU03VTBGRGVFSXNRMEZCUXp0TFFVTktPMGRCUTBZc1EwRkJReXhEUVVGRE96dEJRVVZJTEZOQlFVOHNVMEZCVXl4RFFVRkRPME5CUTJ4Q0lpd2labWxzWlNJNkltZGxibVZ5WVhSbFpDNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpRMjl1ZEdWdWRDSTZXeUpqYjI1emRDQlNaV0ZqZENBOUlISmxjWFZwY21Vb0ozSmxZV04wSnlrN1hHNWpiMjV6ZENCMUlEMGdjbVZ4ZFdseVpTZ25MaTR2ZFc1a1lYTm9KeWs3WEc1Y2JtVjRjRzl5ZENCa1pXWmhkV3gwSUdaMWJtTjBhVzl1SUhkeVlYQkpibkIxZENoSmJuQjFkRU52YlhCdmJtVnVkQ2tnZTF4dVhHNGdJR052Ym5OMElGZHlZWEJKYm5CMWRDQTlJRkpsWVdOMExtTnlaV0YwWlVOc1lYTnpLSHRjYmx4dUlDQWdJRzFwZUdsdWN6b2dXMUpsWVdOMExsQjFjbVZTWlc1a1pYSk5hWGhwYmwwc1hHNWNiaUFnSUNCblpYUkpibWwwYVdGc1UzUmhkR1VvS1NCN1hHNGdJQ0FnSUNCeVpYUjFjbTRnZTF4dUlDQWdJQ0FnSUNCcGMwTnZiblJ5YjJ4c1pXUTZJQ0YxTG1selZXNWtaV1pwYm1Wa0tIUm9hWE11Y0hKdmNITXVkbUZzZFdVcExGeHVJQ0FnSUNBZ0lDQjJZV3gxWlRvZ2RTNXBjMVZ1WkdWbWFXNWxaQ2gwYUdsekxuQnliM0J6TG5aaGJIVmxLU0EvSUhSb2FYTXVjSEp2Y0hNdVpHVm1ZWFZzZEZaaGJIVmxJRG9nZEdocGN5NXdjbTl3Y3k1MllXeDFaVnh1SUNBZ0lDQWdmVHRjYmlBZ0lDQjlMRnh1WEc0Z0lDQWdZMjl0Y0c5dVpXNTBWMmxzYkZKbFkyVnBkbVZRY205d2N5QW9ibVYzVUhKdmNITXBJSHRjYmlBZ0lDQWdJR2xtSUNoMGFHbHpMbk4wWVhSbExtbHpRMjl1ZEhKdmJHeGxaQ2tnZTF4dUlDQWdJQ0FnSUNCcFppQW9JWFV1YVhOVmJtUmxabWx1WldRb2JtVjNVSEp2Y0hNdWRtRnNkV1VwS1NCN1hHNGdJQ0FnSUNBZ0lDQWdkR2hwY3k1elpYUlRkR0YwWlNoN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVd4MVpUb2dibVYzVUhKdmNITXVkbUZzZFdWY2JpQWdJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnZlZ4dUlDQWdJSDBzWEc1Y2JpQWdJQ0J2YmtOb1lXNW5aU0FvYm1WM1ZtRnNkV1VzSUdsdVptOHBJSHRjYmx4dUlDQWdJQ0FnYVdZZ0tFbHVjSFYwUTI5dGNHOXVaVzUwTG1oaGMwVjJaVzUwSUh4OElIUm9hWE11Y0hKdmNITXVhR0Z6UlhabGJuUXBJSHRjYmlBZ0lDQWdJQ0FnWTI5dWMzUWdaWFpsYm5RZ1BTQnVaWGRXWVd4MVpUdGNiaUFnSUNBZ0lDQWdibVYzVm1Gc2RXVWdQU0JsZG1WdWRDNTBZWEpuWlhRdWRtRnNkV1U3WEc0Z0lDQWdJQ0I5WEc1Y2JpQWdJQ0FnSUdsbUlDZ2hkR2hwY3k1emRHRjBaUzVwYzBOdmJuUnliMnhzWldRcElIdGNiaUFnSUNBZ0lDQWdkR2hwY3k1elpYUlRkR0YwWlNoN1hHNGdJQ0FnSUNBZ0lDQWdkbUZzZFdVNklHNWxkMVpoYkhWbFhHNGdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lDQWdmVnh1SUNBZ0lDQWdhV1lnS0NGMGFHbHpMbkJ5YjNCekxtOXVRMmhoYm1kbEtTQjdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJqdGNiaUFnSUNBZ0lIMWNiaUFnSUNBZ0lIUm9hWE11Y0hKdmNITXViMjVEYUdGdVoyVW9ibVYzVm1Gc2RXVXNJR2x1Wm04cE8xeHVJQ0FnSUgwc1hHNWNiaUFnSUNCeVpXNWtaWElvS1NCN1hHNGdJQ0FnSUNCamIyNXpkQ0I3YUdGelJYWmxiblFzSUM0dUxuQnliM0J6ZlNBOUlIUm9hWE11Y0hKdmNITTdYRzVjYmlBZ0lDQWdJSEpsZEhWeWJpQThTVzV3ZFhSRGIyMXdiMjVsYm5RZ2V5NHVMbkJ5YjNCemZWeHVJQ0FnSUNBZ0lDQjJZV3gxWlQxN2RHaHBjeTV6ZEdGMFpTNTJZV3gxWlgxY2JpQWdJQ0FnSUNBZ2IyNURhR0Z1WjJVOWUzUm9hWE11YjI1RGFHRnVaMlY5WEc0Z0lDQWdJQ0F2UGp0Y2JpQWdJQ0I5WEc0Z0lIMHBPMXh1WEc0Z0lISmxkSFZ5YmlCWGNtRndTVzV3ZFhRN1hHNTlYRzRpWFgwPSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9yZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydSZWFjdCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnUmVhY3QnXSA6IG51bGwpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIHdyYXBQdXJlID0gZnVuY3Rpb24gd3JhcFB1cmUoQ29tcG9uZW50KSB7XG5cbiAgdmFyIFdyYXBQdXJlID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1dyYXBQdXJlJyxcblxuICAgIG1peGluczogW19yZWFjdDJbJ2RlZmF1bHQnXS5QdXJlUmVuZGVyTWl4aW5dLFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoQ29tcG9uZW50LCB0aGlzLnByb3BzKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBXcmFwUHVyZTtcbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IHdyYXBQdXJlO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSWk5VmMyVnljeTlxZFhOMGFXNHZaMmwwTDJadmNtMWhkR2xqTDJ4cFlpOWpiMjF3YjI1bGJuUnpMM2R5WVhBdGNIVnlaUzVxY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pT3pzN096czdPenM3Y1VKQlFXdENMRTlCUVU4N096czdRVUZGZWtJc1NVRkJUU3hSUVVGUkxFZEJRVWNzVTBGQldDeFJRVUZSTEVOQlFVa3NVMEZCVXl4RlFVRkxPenRCUVVVNVFpeE5RVUZOTEZGQlFWRXNSMEZCUnl4dFFrRkJUU3hYUVVGWExFTkJRVU03T3p0QlFVVnFReXhWUVVGTkxFVkJRVVVzUTBGQlF5eHRRa0ZCVFN4bFFVRmxMRU5CUVVNN08wRkJSUzlDTEZWQlFVMHNSVUZCUVN4clFrRkJSenRCUVVOUUxHRkJRVThzYVVOQlFVTXNVMEZCVXl4RlFVRkxMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVWNzUTBGQlF6dExRVU55UXp0SFFVTkdMRU5CUVVNc1EwRkJRenM3UVVGRlNDeFRRVUZQTEZGQlFWRXNRMEZCUXp0RFFVTnFRaXhEUVVGRE96dHhRa0ZGWVN4UlFVRlJJaXdpWm1sc1pTSTZJbWRsYm1WeVlYUmxaQzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2V3lKcGJYQnZjblFnVW1WaFkzUWdabkp2YlNBbmNtVmhZM1FuTzF4dVhHNWpiMjV6ZENCM2NtRndVSFZ5WlNBOUlDaERiMjF3YjI1bGJuUXBJRDArSUh0Y2JseHVJQ0JqYjI1emRDQlhjbUZ3VUhWeVpTQTlJRkpsWVdOMExtTnlaV0YwWlVOc1lYTnpLSHRjYmx4dUlDQWdJRzFwZUdsdWN6b2dXMUpsWVdOMExsQjFjbVZTWlc1a1pYSk5hWGhwYmwwc1hHNWNiaUFnSUNCeVpXNWtaWElvS1NCN1hHNGdJQ0FnSUNCeVpYUjFjbTRnUEVOdmJYQnZibVZ1ZENCN0xpNHVkR2hwY3k1d2NtOXdjMzB2UGp0Y2JpQWdJQ0I5WEc0Z0lIMHBPMXh1WEc0Z0lISmxkSFZ5YmlCWGNtRndVSFZ5WlR0Y2JuMDdYRzVjYm1WNGNHOXlkQ0JrWldaaGRXeDBJSGR5WVhCUWRYSmxPMXh1SWwxOSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ1JlYWN0J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydSZWFjdCddIDogbnVsbCk7XG52YXIgXyA9IHJlcXVpcmUoJy4vdW5kYXNoJyk7XG52YXIgQ29tcG9uZW50cyA9IHJlcXVpcmUoJy4vY29tcG9uZW50cycpO1xuLy9jb25zdCBDb21wb25lbnRDb250YWluZXIgPSByZXF1aXJlKCcuL2NvbXBvbmVudC1jb250YWluZXInKTtcblxuLy9Db21wb25lbnRDb250YWluZXIuc2V0Q29tcG9uZW50cyhDb21wb25lbnRzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnZXhwb3J0cycsXG5cbiAgc3RhdGljczogXy5leHRlbmQoe1xuICAgIC8vd3JhcDogcmVxdWlyZSgnLi9jb21wb25lbnRzL3dyYXAtY29tcG9uZW50JylcbiAgICAvL2ZpZWxkOiByZXF1aXJlKCcuL2NvbXBvbmVudHMvd3JhcC1maWVsZCcpLFxuICAgIC8vaGVscGVyOiByZXF1aXJlKCcuL2NvbXBvbmVudHMvd3JhcC1oZWxwZXInKVxuICAgIC8vQ29tcG9uZW50Q29udGFpbmVyOiByZXF1aXJlKCcuL2NvbXBvbmVudHMvY29udGFpbmVycy9jb21wb25lbnQnKVxuICAgIGNvbXBvbmVudHM6IENvbXBvbmVudHNcbiAgfSwgQ29tcG9uZW50cyksXG5cbiAgY29tcG9uZW50OiBmdW5jdGlvbiBjb21wb25lbnQobmFtZSkge1xuICAgIGlmICh0aGlzLnByb3BzLmNvbXBvbmVudCkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMuY29tcG9uZW50KG5hbWUpO1xuICAgIH1cbiAgICB2YXIgY29tcG9uZW50Q2xhc3MgPSB0aGlzLnByb3BzLmNvbXBvbmVudHMgJiYgdGhpcy5wcm9wcy5jb21wb25lbnRzW25hbWVdO1xuICAgIGlmIChjb21wb25lbnRDbGFzcykge1xuICAgICAgcmV0dXJuIGNvbXBvbmVudENsYXNzO1xuICAgIH1cbiAgICByZXR1cm4gQ29tcG9uZW50c1tuYW1lXSB8fCBDb21wb25lbnRzLlVua25vd247XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMuY2hpbGRyZW4gJiYgIV8uaXNBcnJheSh0aGlzLnByb3BzLmNoaWxkcmVuKSkge1xuICAgICAgdmFyIHByb3BzID0gXy5leHRlbmQoe30sIHRoaXMucHJvcHMsIHsgY29tcG9uZW50OiB0aGlzLmNvbXBvbmVudCB9KTtcbiAgICAgIHJldHVybiBSZWFjdC5jbG9uZUVsZW1lbnQodGhpcy5wcm9wcy5jaGlsZHJlbiwgcHJvcHMpO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBtdXN0IHByb3ZpZGUgZXhhY3RseSBvbmUgY2hpbGQgdG8gdGhlIEZvcm1hdGljIGNvbXBvbmVudC4nKTtcbiAgfVxuXG59KTtcblxuLy8gLy8gIyBmb3JtYXRpY1xuLy9cbi8vIC8qXG4vLyBUaGUgcm9vdCBmb3JtYXRpYyBjb21wb25lbnQuXG4vL1xuLy8gVGhlIHJvb3QgZm9ybWF0aWMgY29tcG9uZW50IGlzIGFjdHVhbGx5IHR3byBjb21wb25lbnRzLiBUaGUgbWFpbiBjb21wb25lbnQgaXNcbi8vIGEgY29udHJvbGxlZCBjb21wb25lbnQgd2hlcmUgeW91IG11c3QgcGFzcyB0aGUgdmFsdWUgaW4gd2l0aCBlYWNoIHJlbmRlci4gVGhpc1xuLy8gaXMgYWN0dWFsbHkgd3JhcHBlZCBpbiBhbm90aGVyIGNvbXBvbmVudCB3aGljaCBhbGxvd3MgeW91IHRvIHVzZSBmb3JtYXRpYyBhc1xuLy8gYW4gdW5jb250cm9sbGVkIGNvbXBvbmVudCB3aGVyZSBpdCByZXRhaW5zIHRoZSBzdGF0ZSBvZiB0aGUgdmFsdWUuIFRoZSB3cmFwcGVyXG4vLyBpcyB3aGF0IGlzIGFjdHVhbGx5IGV4cG9ydGVkLlxuLy8gKi9cbi8vXG4vLyAndXNlIHN0cmljdCc7XG4vL1xuLy8gdmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG4vLyB2YXIgXyA9IHJlcXVpcmUoJy4vdW5kYXNoJyk7XG4vL1xuLy8gdmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuLy9cbi8vIHZhciBkZWZhdWx0Q29uZmlnUGx1Z2luID0gcmVxdWlyZSgnLi9kZWZhdWx0LWNvbmZpZycpO1xuLy9cbi8vIHZhciBjcmVhdGVDb25maWcgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuLy8gICB2YXIgcGx1Z2lucyA9IFtkZWZhdWx0Q29uZmlnUGx1Z2luXS5jb25jYXQoYXJncyk7XG4vL1xuLy8gICByZXR1cm4gcGx1Z2lucy5yZWR1Y2UoZnVuY3Rpb24gKGNvbmZpZywgcGx1Z2luKSB7XG4vLyAgICAgaWYgKF8uaXNGdW5jdGlvbihwbHVnaW4pKSB7XG4vLyAgICAgICB2YXIgZXh0ZW5zaW9ucyA9IHBsdWdpbihjb25maWcpO1xuLy8gICAgICAgaWYgKGV4dGVuc2lvbnMpIHtcbi8vICAgICAgICAgXy5leHRlbmQoY29uZmlnLCBleHRlbnNpb25zKTtcbi8vICAgICAgIH1cbi8vICAgICB9IGVsc2Uge1xuLy8gICAgICAgXy5leHRlbmQoY29uZmlnLCBwbHVnaW4pO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgcmV0dXJuIGNvbmZpZztcbi8vICAgfSwge30pO1xuLy8gfTtcbi8vXG4vLyB2YXIgZGVmYXVsdENvbmZpZyA9IGNyZWF0ZUNvbmZpZygpO1xuLy9cbi8vIC8vIFRoZSBtYWluIGZvcm1hdGljIGNvbXBvbmVudCB0aGF0IHJlbmRlcnMgdGhlIGZvcm0uXG4vLyB2YXIgRm9ybWF0aWNDb250cm9sbGVkQ2xhc3MgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4vL1xuLy8gICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljQ29udHJvbGxlZCcsXG4vL1xuLy8gICAvLyBSZXNwb25kIHRvIGFueSB2YWx1ZSBjaGFuZ2VzLlxuLy8gICBvbkNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBpbmZvKSB7XG4vLyAgICAgaWYgKCF0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4vLyAgICAgICByZXR1cm47XG4vLyAgICAgfVxuLy8gICAgIGluZm8gPSBfLmV4dGVuZCh7fSwgaW5mbyk7XG4vLyAgICAgaW5mby5wYXRoID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRWYWx1ZVBhdGgoaW5mby5maWVsZCk7XG4vLyAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBSZXNwb25kIHRvIGFueSBhY3Rpb25zIG90aGVyIHRoYW4gdmFsdWUgY2hhbmdlcy4gKEZvciBleGFtcGxlLCBmb2N1cyBhbmRcbi8vICAgLy8gYmx1ci4pXG4vLyAgIG9uQWN0aW9uOiBmdW5jdGlvbiAoaW5mbykge1xuLy8gICAgIGlmICghdGhpcy5wcm9wcy5vbkFjdGlvbikge1xuLy8gICAgICAgcmV0dXJuO1xuLy8gICAgIH1cbi8vICAgICBpbmZvID0gXy5leHRlbmQoe30sIGluZm8pO1xuLy8gICAgIGluZm8ucGF0aCA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkVmFsdWVQYXRoKGluZm8uZmllbGQpO1xuLy8gICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBSZW5kZXIgdGhlIHJvb3QgY29tcG9uZW50IGJ5IGRlbGVnYXRpbmcgdG8gdGhlIGNvbmZpZy5cbi8vICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4vL1xuLy8gICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbi8vXG4vLyAgICAgcmV0dXJuIGNvbmZpZy5yZW5kZXJGb3JtYXRpY0NvbXBvbmVudCh0aGlzKTtcbi8vICAgfVxuLy8gfSk7XG4vL1xuLy8gdmFyIEZvcm1hdGljQ29udHJvbGxlZCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoRm9ybWF0aWNDb250cm9sbGVkQ2xhc3MpO1xuLy9cbi8vIC8vIEEgd3JhcHBlciBjb21wb25lbnQgdGhhdCBpcyBhY3R1YWxseSBleHBvcnRlZCBhbmQgY2FuIGFsbG93IGZvcm1hdGljIHRvIGJlXG4vLyAvLyB1c2VkIGluIGFuIFwidW5jb250cm9sbGVkXCIgbWFubmVyLiAoU2VlIHVuY29udHJvbGxlZCBjb21wb25lbnRzIGluIHRoZSBSZWFjdFxuLy8gLy8gZG9jdW1lbnRhdGlvbiBmb3IgYW4gZXhwbGFuYXRpb24gb2YgdGhlIGRpZmZlcmVuY2UuKVxuLy8gbW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4vL1xuLy8gICAvLyBFeHBvcnQgc29tZSBzdHVmZiBhcyBzdGF0aWNzLlxuLy8gICBzdGF0aWNzOiB7XG4vLyAgICAgY3JlYXRlQ29uZmlnOiBjcmVhdGVDb25maWcsXG4vLyAgICAgYXZhaWxhYmxlTWl4aW5zOiB7XG4vLyAgICAgICBjbGlja091dHNpZGU6IHJlcXVpcmUoJy4vbWl4aW5zL2NsaWNrLW91dHNpZGUuanMnKSxcbi8vICAgICAgIGZpZWxkOiByZXF1aXJlKCcuL21peGlucy9maWVsZC5qcycpLFxuLy8gICAgICAgaGVscGVyOiByZXF1aXJlKCcuL21peGlucy9oZWxwZXIuanMnKSxcbi8vICAgICAgIHJlc2l6ZTogcmVxdWlyZSgnLi9taXhpbnMvcmVzaXplLmpzJyksXG4vLyAgICAgICBzY3JvbGw6IHJlcXVpcmUoJy4vbWl4aW5zL3Njcm9sbC5qcycpLFxuLy8gICAgICAgdW5kb1N0YWNrOiByZXF1aXJlKCcuL21peGlucy91bmRvLXN0YWNrLmpzJylcbi8vICAgICB9LFxuLy8gICAgIHBsdWdpbnM6IHtcbi8vICAgICAgIGJvb3RzdHJhcDogcmVxdWlyZSgnLi9wbHVnaW5zL2Jvb3RzdHJhcCcpLFxuLy8gICAgICAgbWV0YTogcmVxdWlyZSgnLi9wbHVnaW5zL21ldGEnKSxcbi8vICAgICAgIHJlZmVyZW5jZTogcmVxdWlyZSgnLi9wbHVnaW5zL3JlZmVyZW5jZScpLFxuLy8gICAgICAgZWxlbWVudENsYXNzZXM6IHJlcXVpcmUoJy4vcGx1Z2lucy9lbGVtZW50LWNsYXNzZXMnKVxuLy8gICAgIH0sXG4vLyAgICAgdXRpbHM6IHV0aWxzXG4vLyAgIH0sXG4vL1xuLy8gICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljJyxcbi8vXG4vLyAgIC8vIElmIHdlIGdvdCBhIHZhbHVlLCB0cmVhdCB0aGlzIGNvbXBvbmVudCBhcyBjb250cm9sbGVkLiBFaXRoZXIgd2F5LCByZXRhaW5cbi8vICAgLy8gdGhlIHZhbHVlIGluIHRoZSBzdGF0ZS5cbi8vICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4vLyAgICAgcmV0dXJuIHtcbi8vICAgICAgIGlzQ29udHJvbGxlZDogIV8uaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSksXG4vLyAgICAgICB2YWx1ZTogXy5pc1VuZGVmaW5lZCh0aGlzLnByb3BzLnZhbHVlKSA/IHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlIDogdGhpcy5wcm9wcy52YWx1ZVxuLy8gICAgIH07XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBJZiB0aGlzIGlzIGEgY29udHJvbGxlZCBjb21wb25lbnQsIGNoYW5nZSBvdXIgc3RhdGUgdG8gcmVmbGVjdCB0aGUgbmV3XG4vLyAgIC8vIHZhbHVlLiBGb3IgdW5jb250cm9sbGVkIGNvbXBvbmVudHMsIGlnbm9yZSBhbnkgdmFsdWUgY2hhbmdlcy5cbi8vICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG4vLyAgICAgaWYgKHRoaXMuc3RhdGUuaXNDb250cm9sbGVkKSB7XG4vLyAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQobmV3UHJvcHMudmFsdWUpKSB7XG4vLyAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuLy8gICAgICAgICAgIHZhbHVlOiBuZXdQcm9wcy52YWx1ZVxuLy8gICAgICAgICB9KTtcbi8vICAgICAgIH1cbi8vICAgICB9XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBJZiB0aGlzIGlzIGFuIHVuY29udHJvbGxlZCBjb21wb25lbnQsIHNldCBvdXIgc3RhdGUgdG8gcmVmbGVjdCB0aGUgbmV3XG4vLyAgIC8vIHZhbHVlLiBFaXRoZXIgd2F5LCBjYWxsIHRoZSBvbkNoYW5nZSBjYWxsYmFjay5cbi8vICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuLy8gICAgIGlmICghdGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbi8vICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuLy8gICAgICAgICB2YWx1ZTogbmV3VmFsdWVcbi8vICAgICAgIH0pO1xuLy8gICAgIH1cbi8vICAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbi8vICAgICAgIHJldHVybjtcbi8vICAgICB9XG4vLyAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBBbnkgYWN0aW9ucyBzaG91bGQgYmUgc2VudCB0byB0aGUgZ2VuZXJpYyBvbkFjdGlvbiBjYWxsYmFjayBidXQgYWxzbyBzcGxpdFxuLy8gICAvLyBpbnRvIGRpc2NyZWV0IGNhbGxiYWNrcyBwZXIgYWN0aW9uLlxuLy8gICBvbkFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbi8vICAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuLy8gICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbi8vICAgICB9XG4vLyAgICAgdmFyIGFjdGlvbiA9IHV0aWxzLmRhc2hUb1Bhc2NhbChpbmZvLmFjdGlvbik7XG4vLyAgICAgaWYgKHRoaXMucHJvcHNbJ29uJyArIGFjdGlvbl0pIHtcbi8vICAgICAgIHRoaXMucHJvcHNbJ29uJyArIGFjdGlvbl0oaW5mbyk7XG4vLyAgICAgfVxuLy8gICB9LFxuLy9cbi8vICAgLy8gUmVuZGVyIHRoZSB3cmFwcGVyIGNvbXBvbmVudCAoYnkganVzdCBkZWxlZ2F0aW5nIHRvIHRoZSBtYWluIGNvbXBvbmVudCkuXG4vLyAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuLy9cbi8vICAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWcgfHwgZGVmYXVsdENvbmZpZztcbi8vICAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuLy9cbi8vICAgICBpZiAodGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbi8vICAgICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuLy8gICAgICAgICBjb25zb2xlLmxvZygnWW91IHNob3VsZCBzdXBwbHkgYW4gb25DaGFuZ2UgaGFuZGxlciBpZiB5b3Ugc3VwcGx5IGEgdmFsdWUuJyk7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy9cbi8vICAgICB2YXIgcHJvcHMgPSB7XG4vLyAgICAgICBjb25maWc6IGNvbmZpZyxcbi8vICAgICAgIC8vIEFsbG93IGZpZWxkIHRlbXBsYXRlcyB0byBiZSBwYXNzZWQgaW4gYXMgYGZpZWxkYCBvciBgZmllbGRzYC4gQWZ0ZXIgdGhpcywgc3RvcFxuLy8gICAgICAgLy8gY2FsbGluZyB0aGVtIGZpZWxkcy5cbi8vICAgICAgIGZpZWxkVGVtcGxhdGU6IHRoaXMucHJvcHMuZmllbGQsXG4vLyAgICAgICBmaWVsZFRlbXBsYXRlczogdGhpcy5wcm9wcy5maWVsZHMsXG4vLyAgICAgICB2YWx1ZTogdmFsdWUsXG4vLyAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbi8vICAgICAgIG9uQWN0aW9uOiB0aGlzLm9uQWN0aW9uXG4vLyAgICAgfTtcbi8vXG4vLyAgICAgXy5lYWNoKHRoaXMucHJvcHMsIGZ1bmN0aW9uIChwcm9wVmFsdWUsIGtleSkge1xuLy8gICAgICAgaWYgKCEoa2V5IGluIHByb3BzKSkge1xuLy8gICAgICAgICBwcm9wc1trZXldID0gcHJvcFZhbHVlO1xuLy8gICAgICAgfVxuLy8gICAgIH0pO1xuLy9cbi8vICAgICByZXR1cm4gRm9ybWF0aWNDb250cm9sbGVkKHByb3BzKTtcbi8vICAgfVxuLy9cbi8vIH0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYklpOVZjMlZ5Y3k5cWRYTjBhVzR2WjJsMEwyWnZjbTFoZEdsakwyeHBZaTltYjNKdFlYUnBZeTVxY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pT3pzN1FVRkJRU3hKUVVGTkxFdEJRVXNzUjBGQlJ5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNN1FVRkRMMElzU1VGQlRTeERRVUZETEVkQlFVY3NUMEZCVHl4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRE8wRkJRemxDTEVsQlFVMHNWVUZCVlN4SFFVRkhMRTlCUVU4c1EwRkJReXhqUVVGakxFTkJRVU1zUTBGQlF6czdPenM3UVVGTE0wTXNUVUZCVFN4RFFVRkRMRTlCUVU4c1IwRkJSeXhMUVVGTExFTkJRVU1zVjBGQlZ5eERRVUZET3pzN1FVRkZha01zVTBGQlR5eEZRVUZGTEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNN096czdPMEZCUzJoQ0xHTkJRVlVzUlVGQlJTeFZRVUZWTzBkQlEzWkNMRVZCUTBNc1ZVRkJWU3hEUVVOWU96dEJRVVZFTEZkQlFWTXNSVUZCUVN4dFFrRkJReXhKUVVGSkxFVkJRVVU3UVVGRFpDeFJRVUZKTEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1UwRkJVeXhGUVVGRk8wRkJRM2hDTEdGQlFVOHNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhUUVVGVExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdTMEZEYmtNN1FVRkRSQ3hSUVVGTkxHTkJRV01zUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRlZCUVZVc1NVRkJTU3hKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRCUVVNMVJTeFJRVUZKTEdOQlFXTXNSVUZCUlR0QlFVTnNRaXhoUVVGUExHTkJRV01zUTBGQlF6dExRVU4yUWp0QlFVTkVMRmRCUVU4c1ZVRkJWU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEZWQlFWVXNRMEZCUXl4UFFVRlBMRU5CUVVNN1IwRkRMME03TzBGQlJVUXNVVUZCVFN4RlFVRkJMR3RDUVVGSE8wRkJRMUFzVVVGQlNTeEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRkZCUVZFc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJUdEJRVU14UkN4VlFVRk5MRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEVWQlFVVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1MwRkJTeXhGUVVGRkxFVkJRVU1zVTBGQlV5eEZRVUZGTEVsQlFVa3NRMEZCUXl4VFFVRlRMRVZCUVVNc1EwRkJReXhEUVVGRE8wRkJRM0JGTEdGQlFVOHNTMEZCU3l4RFFVRkRMRmxCUVZrc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEZGQlFWRXNSVUZCUlN4TFFVRkxMRU5CUVVNc1EwRkJRenRMUVVOMlJEdEJRVU5FTEZWQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc0swUkJRU3RFTEVOQlFVTXNRMEZCUXp0SFFVTnNSanM3UTBGRlJpeERRVUZETEVOQlFVTWlMQ0ptYVd4bElqb2laMlZ1WlhKaGRHVmtMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE5EYjI1MFpXNTBJanBiSW1OdmJuTjBJRkpsWVdOMElEMGdjbVZ4ZFdseVpTZ25jbVZoWTNRbktUdGNibU52Ym5OMElGOGdQU0J5WlhGMWFYSmxLQ2N1TDNWdVpHRnphQ2NwTzF4dVkyOXVjM1FnUTI5dGNHOXVaVzUwY3lBOUlISmxjWFZwY21Vb0p5NHZZMjl0Y0c5dVpXNTBjeWNwTzF4dUx5OWpiMjV6ZENCRGIyMXdiMjVsYm5SRGIyNTBZV2x1WlhJZ1BTQnlaWEYxYVhKbEtDY3VMMk52YlhCdmJtVnVkQzFqYjI1MFlXbHVaWEluS1R0Y2JseHVMeTlEYjIxd2IyNWxiblJEYjI1MFlXbHVaWEl1YzJWMFEyOXRjRzl1Wlc1MGN5aERiMjF3YjI1bGJuUnpLVHRjYmx4dWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCU1pXRmpkQzVqY21WaGRHVkRiR0Z6Y3loN1hHNWNiaUFnYzNSaGRHbGpjem9nWHk1bGVIUmxibVFvZTF4dUlDQWdJQzh2ZDNKaGNEb2djbVZ4ZFdseVpTZ25MaTlqYjIxd2IyNWxiblJ6TDNkeVlYQXRZMjl0Y0c5dVpXNTBKeWxjYmlBZ0lDQXZMMlpwWld4a09pQnlaWEYxYVhKbEtDY3VMMk52YlhCdmJtVnVkSE12ZDNKaGNDMW1hV1ZzWkNjcExGeHVJQ0FnSUM4dmFHVnNjR1Z5T2lCeVpYRjFhWEpsS0NjdUwyTnZiWEJ2Ym1WdWRITXZkM0poY0Mxb1pXeHdaWEluS1Z4dUlDQWdJQzh2UTI5dGNHOXVaVzUwUTI5dWRHRnBibVZ5T2lCeVpYRjFhWEpsS0NjdUwyTnZiWEJ2Ym1WdWRITXZZMjl1ZEdGcGJtVnljeTlqYjIxd2IyNWxiblFuS1Z4dUlDQWdJR052YlhCdmJtVnVkSE02SUVOdmJYQnZibVZ1ZEhOY2JpQWdmU3hjYmlBZ0lDQkRiMjF3YjI1bGJuUnpYRzRnSUNrc1hHNWNiaUFnWTI5dGNHOXVaVzUwS0c1aGJXVXBJSHRjYmlBZ0lDQnBaaUFvZEdocGN5NXdjbTl3Y3k1amIyMXdiMjVsYm5RcElIdGNiaUFnSUNBZ0lISmxkSFZ5YmlCMGFHbHpMbkJ5YjNCekxtTnZiWEJ2Ym1WdWRDaHVZVzFsS1R0Y2JpQWdJQ0I5WEc0Z0lDQWdZMjl1YzNRZ1kyOXRjRzl1Wlc1MFEyeGhjM01nUFNCMGFHbHpMbkJ5YjNCekxtTnZiWEJ2Ym1WdWRITWdKaVlnZEdocGN5NXdjbTl3Y3k1amIyMXdiMjVsYm5SelcyNWhiV1ZkTzF4dUlDQWdJR2xtSUNoamIyMXdiMjVsYm5SRGJHRnpjeWtnZTF4dUlDQWdJQ0FnY21WMGRYSnVJR052YlhCdmJtVnVkRU5zWVhOek8xeHVJQ0FnSUgxY2JpQWdJQ0J5WlhSMWNtNGdRMjl0Y0c5dVpXNTBjMXR1WVcxbFhTQjhmQ0JEYjIxd2IyNWxiblJ6TGxWdWEyNXZkMjQ3WEc0Z0lIMHNYRzVjYmlBZ2NtVnVaR1Z5S0NrZ2UxeHVJQ0FnSUdsbUlDaDBhR2x6TG5CeWIzQnpMbU5vYVd4a2NtVnVJQ1ltSUNGZkxtbHpRWEp5WVhrb2RHaHBjeTV3Y205d2N5NWphR2xzWkhKbGJpa3BJSHRjYmlBZ0lDQWdJR052Ym5OMElIQnliM0J6SUQwZ1h5NWxlSFJsYm1Rb2UzMHNJSFJvYVhNdWNISnZjSE1zSUh0amIyMXdiMjVsYm5RNklIUm9hWE11WTI5dGNHOXVaVzUwZlNrN1hHNGdJQ0FnSUNCeVpYUjFjbTRnVW1WaFkzUXVZMnh2Ym1WRmJHVnRaVzUwS0hSb2FYTXVjSEp2Y0hNdVkyaHBiR1J5Wlc0c0lIQnliM0J6S1R0Y2JpQWdJQ0I5WEc0Z0lDQWdkR2h5YjNjZ2JtVjNJRVZ5Y205eUtDZFpiM1VnYlhWemRDQndjbTkyYVdSbElHVjRZV04wYkhrZ2IyNWxJR05vYVd4a0lIUnZJSFJvWlNCR2IzSnRZWFJwWXlCamIyMXdiMjVsYm5RdUp5azdYRzRnSUgxY2JseHVmU2s3WEc1Y2JseHVMeThnTHk4Z0l5Qm1iM0p0WVhScFkxeHVMeTljYmk4dklDOHFYRzR2THlCVWFHVWdjbTl2ZENCbWIzSnRZWFJwWXlCamIyMXdiMjVsYm5RdVhHNHZMMXh1THk4Z1ZHaGxJSEp2YjNRZ1ptOXliV0YwYVdNZ1kyOXRjRzl1Wlc1MElHbHpJR0ZqZEhWaGJHeDVJSFIzYnlCamIyMXdiMjVsYm5SekxpQlVhR1VnYldGcGJpQmpiMjF3YjI1bGJuUWdhWE5jYmk4dklHRWdZMjl1ZEhKdmJHeGxaQ0JqYjIxd2IyNWxiblFnZDJobGNtVWdlVzkxSUcxMWMzUWdjR0Z6Y3lCMGFHVWdkbUZzZFdVZ2FXNGdkMmwwYUNCbFlXTm9JSEpsYm1SbGNpNGdWR2hwYzF4dUx5OGdhWE1nWVdOMGRXRnNiSGtnZDNKaGNIQmxaQ0JwYmlCaGJtOTBhR1Z5SUdOdmJYQnZibVZ1ZENCM2FHbGphQ0JoYkd4dmQzTWdlVzkxSUhSdklIVnpaU0JtYjNKdFlYUnBZeUJoYzF4dUx5OGdZVzRnZFc1amIyNTBjbTlzYkdWa0lHTnZiWEJ2Ym1WdWRDQjNhR1Z5WlNCcGRDQnlaWFJoYVc1eklIUm9aU0J6ZEdGMFpTQnZaaUIwYUdVZ2RtRnNkV1V1SUZSb1pTQjNjbUZ3Y0dWeVhHNHZMeUJwY3lCM2FHRjBJR2x6SUdGamRIVmhiR3g1SUdWNGNHOXlkR1ZrTGx4dUx5OGdLaTljYmk4dlhHNHZMeUFuZFhObElITjBjbWxqZENjN1hHNHZMMXh1THk4Z2RtRnlJRkpsWVdOMElEMGdjbVZ4ZFdseVpTZ25jbVZoWTNRdllXUmtiMjV6SnlrN1hHNHZMeUIyWVhJZ1h5QTlJSEpsY1hWcGNtVW9KeTR2ZFc1a1lYTm9KeWs3WEc0dkwxeHVMeThnZG1GeUlIVjBhV3h6SUQwZ2NtVnhkV2x5WlNnbkxpOTFkR2xzY3ljcE8xeHVMeTljYmk4dklIWmhjaUJrWldaaGRXeDBRMjl1Wm1sblVHeDFaMmx1SUQwZ2NtVnhkV2x5WlNnbkxpOWtaV1poZFd4MExXTnZibVpwWnljcE8xeHVMeTljYmk4dklIWmhjaUJqY21WaGRHVkRiMjVtYVdjZ1BTQm1kVzVqZEdsdmJpQW9MaTR1WVhKbmN5a2dlMXh1THk4Z0lDQjJZWElnY0d4MVoybHVjeUE5SUZ0a1pXWmhkV3gwUTI5dVptbG5VR3gxWjJsdVhTNWpiMjVqWVhRb1lYSm5jeWs3WEc0dkwxeHVMeThnSUNCeVpYUjFjbTRnY0d4MVoybHVjeTV5WldSMVkyVW9ablZ1WTNScGIyNGdLR052Ym1acFp5d2djR3gxWjJsdUtTQjdYRzR2THlBZ0lDQWdhV1lnS0Y4dWFYTkdkVzVqZEdsdmJpaHdiSFZuYVc0cEtTQjdYRzR2THlBZ0lDQWdJQ0IyWVhJZ1pYaDBaVzV6YVc5dWN5QTlJSEJzZFdkcGJpaGpiMjVtYVdjcE8xeHVMeThnSUNBZ0lDQWdhV1lnS0dWNGRHVnVjMmx2Ym5NcElIdGNiaTh2SUNBZ0lDQWdJQ0FnWHk1bGVIUmxibVFvWTI5dVptbG5MQ0JsZUhSbGJuTnBiMjV6S1R0Y2JpOHZJQ0FnSUNBZ0lIMWNiaTh2SUNBZ0lDQjlJR1ZzYzJVZ2UxeHVMeThnSUNBZ0lDQWdYeTVsZUhSbGJtUW9ZMjl1Wm1sbkxDQndiSFZuYVc0cE8xeHVMeThnSUNBZ0lIMWNiaTh2WEc0dkx5QWdJQ0FnY21WMGRYSnVJR052Ym1acFp6dGNiaTh2SUNBZ2ZTd2dlMzBwTzF4dUx5OGdmVHRjYmk4dlhHNHZMeUIyWVhJZ1pHVm1ZWFZzZEVOdmJtWnBaeUE5SUdOeVpXRjBaVU52Ym1acFp5Z3BPMXh1THk5Y2JpOHZJQzh2SUZSb1pTQnRZV2x1SUdadmNtMWhkR2xqSUdOdmJYQnZibVZ1ZENCMGFHRjBJSEpsYm1SbGNuTWdkR2hsSUdadmNtMHVYRzR2THlCMllYSWdSbTl5YldGMGFXTkRiMjUwY205c2JHVmtRMnhoYzNNZ1BTQlNaV0ZqZEM1amNtVmhkR1ZEYkdGemN5aDdYRzR2TDF4dUx5OGdJQ0JrYVhOd2JHRjVUbUZ0WlRvZ0owWnZjbTFoZEdsalEyOXVkSEp2Ykd4bFpDY3NYRzR2TDF4dUx5OGdJQ0F2THlCU1pYTndiMjVrSUhSdklHRnVlU0IyWVd4MVpTQmphR0Z1WjJWekxseHVMeThnSUNCdmJrTm9ZVzVuWlRvZ1puVnVZM1JwYjI0Z0tHNWxkMVpoYkhWbExDQnBibVp2S1NCN1hHNHZMeUFnSUNBZ2FXWWdLQ0YwYUdsekxuQnliM0J6TG05dVEyaGhibWRsS1NCN1hHNHZMeUFnSUNBZ0lDQnlaWFIxY200N1hHNHZMeUFnSUNBZ2ZWeHVMeThnSUNBZ0lHbHVabThnUFNCZkxtVjRkR1Z1WkNoN2ZTd2dhVzVtYnlrN1hHNHZMeUFnSUNBZ2FXNW1ieTV3WVhSb0lEMGdkR2hwY3k1d2NtOXdjeTVqYjI1bWFXY3VabWxsYkdSV1lXeDFaVkJoZEdnb2FXNW1ieTVtYVdWc1pDazdYRzR2THlBZ0lDQWdkR2hwY3k1d2NtOXdjeTV2YmtOb1lXNW5aU2h1WlhkV1lXeDFaU3dnYVc1bWJ5azdYRzR2THlBZ0lIMHNYRzR2TDF4dUx5OGdJQ0F2THlCU1pYTndiMjVrSUhSdklHRnVlU0JoWTNScGIyNXpJRzkwYUdWeUlIUm9ZVzRnZG1Gc2RXVWdZMmhoYm1kbGN5NGdLRVp2Y2lCbGVHRnRjR3hsTENCbWIyTjFjeUJoYm1SY2JpOHZJQ0FnTHk4Z1lteDFjaTRwWEc0dkx5QWdJRzl1UVdOMGFXOXVPaUJtZFc1amRHbHZiaUFvYVc1bWJ5a2dlMXh1THk4Z0lDQWdJR2xtSUNnaGRHaHBjeTV3Y205d2N5NXZia0ZqZEdsdmJpa2dlMXh1THk4Z0lDQWdJQ0FnY21WMGRYSnVPMXh1THk4Z0lDQWdJSDFjYmk4dklDQWdJQ0JwYm1adklEMGdYeTVsZUhSbGJtUW9lMzBzSUdsdVptOHBPMXh1THk4Z0lDQWdJR2x1Wm04dWNHRjBhQ0E5SUhSb2FYTXVjSEp2Y0hNdVkyOXVabWxuTG1acFpXeGtWbUZzZFdWUVlYUm9LR2x1Wm04dVptbGxiR1FwTzF4dUx5OGdJQ0FnSUhSb2FYTXVjSEp2Y0hNdWIyNUJZM1JwYjI0b2FXNW1ieWs3WEc0dkx5QWdJSDBzWEc0dkwxeHVMeThnSUNBdkx5QlNaVzVrWlhJZ2RHaGxJSEp2YjNRZ1kyOXRjRzl1Wlc1MElHSjVJR1JsYkdWbllYUnBibWNnZEc4Z2RHaGxJR052Ym1acFp5NWNiaTh2SUNBZ2NtVnVaR1Z5T2lCbWRXNWpkR2x2YmlBb0tTQjdYRzR2TDF4dUx5OGdJQ0FnSUhaaGNpQmpiMjVtYVdjZ1BTQjBhR2x6TG5CeWIzQnpMbU52Ym1acFp6dGNiaTh2WEc0dkx5QWdJQ0FnY21WMGRYSnVJR052Ym1acFp5NXlaVzVrWlhKR2IzSnRZWFJwWTBOdmJYQnZibVZ1ZENoMGFHbHpLVHRjYmk4dklDQWdmVnh1THk4Z2ZTazdYRzR2TDF4dUx5OGdkbUZ5SUVadmNtMWhkR2xqUTI5dWRISnZiR3hsWkNBOUlGSmxZV04wTG1OeVpXRjBaVVpoWTNSdmNua29SbTl5YldGMGFXTkRiMjUwY205c2JHVmtRMnhoYzNNcE8xeHVMeTljYmk4dklDOHZJRUVnZDNKaGNIQmxjaUJqYjIxd2IyNWxiblFnZEdoaGRDQnBjeUJoWTNSMVlXeHNlU0JsZUhCdmNuUmxaQ0JoYm1RZ1kyRnVJR0ZzYkc5M0lHWnZjbTFoZEdsaklIUnZJR0psWEc0dkx5QXZMeUIxYzJWa0lHbHVJR0Z1SUZ3aWRXNWpiMjUwY205c2JHVmtYQ0lnYldGdWJtVnlMaUFvVTJWbElIVnVZMjl1ZEhKdmJHeGxaQ0JqYjIxd2IyNWxiblJ6SUdsdUlIUm9aU0JTWldGamRGeHVMeThnTHk4Z1pHOWpkVzFsYm5SaGRHbHZiaUJtYjNJZ1lXNGdaWGh3YkdGdVlYUnBiMjRnYjJZZ2RHaGxJR1JwWm1abGNtVnVZMlV1S1Z4dUx5OGdiVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQlNaV0ZqZEM1amNtVmhkR1ZEYkdGemN5aDdYRzR2TDF4dUx5OGdJQ0F2THlCRmVIQnZjblFnYzI5dFpTQnpkSFZtWmlCaGN5QnpkR0YwYVdOekxseHVMeThnSUNCemRHRjBhV056T2lCN1hHNHZMeUFnSUNBZ1kzSmxZWFJsUTI5dVptbG5PaUJqY21WaGRHVkRiMjVtYVdjc1hHNHZMeUFnSUNBZ1lYWmhhV3hoWW14bFRXbDRhVzV6T2lCN1hHNHZMeUFnSUNBZ0lDQmpiR2xqYTA5MWRITnBaR1U2SUhKbGNYVnBjbVVvSnk0dmJXbDRhVzV6TDJOc2FXTnJMVzkxZEhOcFpHVXVhbk1uS1N4Y2JpOHZJQ0FnSUNBZ0lHWnBaV3hrT2lCeVpYRjFhWEpsS0NjdUwyMXBlR2x1Y3k5bWFXVnNaQzVxY3ljcExGeHVMeThnSUNBZ0lDQWdhR1ZzY0dWeU9pQnlaWEYxYVhKbEtDY3VMMjFwZUdsdWN5OW9aV3h3WlhJdWFuTW5LU3hjYmk4dklDQWdJQ0FnSUhKbGMybDZaVG9nY21WeGRXbHlaU2duTGk5dGFYaHBibk12Y21WemFYcGxMbXB6Snlrc1hHNHZMeUFnSUNBZ0lDQnpZM0p2Ykd3NklISmxjWFZwY21Vb0p5NHZiV2w0YVc1ekwzTmpjbTlzYkM1cWN5Y3BMRnh1THk4Z0lDQWdJQ0FnZFc1a2IxTjBZV05yT2lCeVpYRjFhWEpsS0NjdUwyMXBlR2x1Y3k5MWJtUnZMWE4wWVdOckxtcHpKeWxjYmk4dklDQWdJQ0I5TEZ4dUx5OGdJQ0FnSUhCc2RXZHBibk02SUh0Y2JpOHZJQ0FnSUNBZ0lHSnZiM1J6ZEhKaGNEb2djbVZ4ZFdseVpTZ25MaTl3YkhWbmFXNXpMMkp2YjNSemRISmhjQ2NwTEZ4dUx5OGdJQ0FnSUNBZ2JXVjBZVG9nY21WeGRXbHlaU2duTGk5d2JIVm5hVzV6TDIxbGRHRW5LU3hjYmk4dklDQWdJQ0FnSUhKbFptVnlaVzVqWlRvZ2NtVnhkV2x5WlNnbkxpOXdiSFZuYVc1ekwzSmxabVZ5Wlc1alpTY3BMRnh1THk4Z0lDQWdJQ0FnWld4bGJXVnVkRU5zWVhOelpYTTZJSEpsY1hWcGNtVW9KeTR2Y0d4MVoybHVjeTlsYkdWdFpXNTBMV05zWVhOelpYTW5LVnh1THk4Z0lDQWdJSDBzWEc0dkx5QWdJQ0FnZFhScGJITTZJSFYwYVd4elhHNHZMeUFnSUgwc1hHNHZMMXh1THk4Z0lDQmthWE53YkdGNVRtRnRaVG9nSjBadmNtMWhkR2xqSnl4Y2JpOHZYRzR2THlBZ0lDOHZJRWxtSUhkbElHZHZkQ0JoSUhaaGJIVmxMQ0IwY21WaGRDQjBhR2x6SUdOdmJYQnZibVZ1ZENCaGN5QmpiMjUwY205c2JHVmtMaUJGYVhSb1pYSWdkMkY1TENCeVpYUmhhVzVjYmk4dklDQWdMeThnZEdobElIWmhiSFZsSUdsdUlIUm9aU0J6ZEdGMFpTNWNiaTh2SUNBZ1oyVjBTVzVwZEdsaGJGTjBZWFJsT2lCbWRXNWpkR2x2YmlBb0tTQjdYRzR2THlBZ0lDQWdjbVYwZFhKdUlIdGNiaTh2SUNBZ0lDQWdJR2x6UTI5dWRISnZiR3hsWkRvZ0lWOHVhWE5WYm1SbFptbHVaV1FvZEdocGN5NXdjbTl3Y3k1MllXeDFaU2tzWEc0dkx5QWdJQ0FnSUNCMllXeDFaVG9nWHk1cGMxVnVaR1ZtYVc1bFpDaDBhR2x6TG5CeWIzQnpMblpoYkhWbEtTQS9JSFJvYVhNdWNISnZjSE11WkdWbVlYVnNkRlpoYkhWbElEb2dkR2hwY3k1d2NtOXdjeTUyWVd4MVpWeHVMeThnSUNBZ0lIMDdYRzR2THlBZ0lIMHNYRzR2TDF4dUx5OGdJQ0F2THlCSlppQjBhR2x6SUdseklHRWdZMjl1ZEhKdmJHeGxaQ0JqYjIxd2IyNWxiblFzSUdOb1lXNW5aU0J2ZFhJZ2MzUmhkR1VnZEc4Z2NtVm1iR1ZqZENCMGFHVWdibVYzWEc0dkx5QWdJQzh2SUhaaGJIVmxMaUJHYjNJZ2RXNWpiMjUwY205c2JHVmtJR052YlhCdmJtVnVkSE1zSUdsbmJtOXlaU0JoYm5rZ2RtRnNkV1VnWTJoaGJtZGxjeTVjYmk4dklDQWdZMjl0Y0c5dVpXNTBWMmxzYkZKbFkyVnBkbVZRY205d2N6b2dablZ1WTNScGIyNGdLRzVsZDFCeWIzQnpLU0I3WEc0dkx5QWdJQ0FnYVdZZ0tIUm9hWE11YzNSaGRHVXVhWE5EYjI1MGNtOXNiR1ZrS1NCN1hHNHZMeUFnSUNBZ0lDQnBaaUFvSVY4dWFYTlZibVJsWm1sdVpXUW9ibVYzVUhKdmNITXVkbUZzZFdVcEtTQjdYRzR2THlBZ0lDQWdJQ0FnSUhSb2FYTXVjMlYwVTNSaGRHVW9lMXh1THk4Z0lDQWdJQ0FnSUNBZ0lIWmhiSFZsT2lCdVpYZFFjbTl3Y3k1MllXeDFaVnh1THk4Z0lDQWdJQ0FnSUNCOUtUdGNiaTh2SUNBZ0lDQWdJSDFjYmk4dklDQWdJQ0I5WEc0dkx5QWdJSDBzWEc0dkwxeHVMeThnSUNBdkx5QkpaaUIwYUdseklHbHpJR0Z1SUhWdVkyOXVkSEp2Ykd4bFpDQmpiMjF3YjI1bGJuUXNJSE5sZENCdmRYSWdjM1JoZEdVZ2RHOGdjbVZtYkdWamRDQjBhR1VnYm1WM1hHNHZMeUFnSUM4dklIWmhiSFZsTGlCRmFYUm9aWElnZDJGNUxDQmpZV3hzSUhSb1pTQnZia05vWVc1blpTQmpZV3hzWW1GamF5NWNiaTh2SUNBZ2IyNURhR0Z1WjJVNklHWjFibU4wYVc5dUlDaHVaWGRXWVd4MVpTd2dhVzVtYnlrZ2UxeHVMeThnSUNBZ0lHbG1JQ2doZEdocGN5NXpkR0YwWlM1cGMwTnZiblJ5YjJ4c1pXUXBJSHRjYmk4dklDQWdJQ0FnSUhSb2FYTXVjMlYwVTNSaGRHVW9lMXh1THk4Z0lDQWdJQ0FnSUNCMllXeDFaVG9nYm1WM1ZtRnNkV1ZjYmk4dklDQWdJQ0FnSUgwcE8xeHVMeThnSUNBZ0lIMWNiaTh2SUNBZ0lDQnBaaUFvSVhSb2FYTXVjSEp2Y0hNdWIyNURhR0Z1WjJVcElIdGNiaTh2SUNBZ0lDQWdJSEpsZEhWeWJqdGNiaTh2SUNBZ0lDQjlYRzR2THlBZ0lDQWdkR2hwY3k1d2NtOXdjeTV2YmtOb1lXNW5aU2h1WlhkV1lXeDFaU3dnYVc1bWJ5azdYRzR2THlBZ0lIMHNYRzR2TDF4dUx5OGdJQ0F2THlCQmJua2dZV04wYVc5dWN5QnphRzkxYkdRZ1ltVWdjMlZ1ZENCMGJ5QjBhR1VnWjJWdVpYSnBZeUJ2YmtGamRHbHZiaUJqWVd4c1ltRmpheUJpZFhRZ1lXeHpieUJ6Y0d4cGRGeHVMeThnSUNBdkx5QnBiblJ2SUdScGMyTnlaV1YwSUdOaGJHeGlZV05yY3lCd1pYSWdZV04wYVc5dUxseHVMeThnSUNCdmJrRmpkR2x2YmpvZ1puVnVZM1JwYjI0Z0tHbHVabThwSUh0Y2JpOHZJQ0FnSUNCcFppQW9kR2hwY3k1d2NtOXdjeTV2YmtGamRHbHZiaWtnZTF4dUx5OGdJQ0FnSUNBZ2RHaHBjeTV3Y205d2N5NXZia0ZqZEdsdmJpaHBibVp2S1R0Y2JpOHZJQ0FnSUNCOVhHNHZMeUFnSUNBZ2RtRnlJR0ZqZEdsdmJpQTlJSFYwYVd4ekxtUmhjMmhVYjFCaGMyTmhiQ2hwYm1adkxtRmpkR2x2YmlrN1hHNHZMeUFnSUNBZ2FXWWdLSFJvYVhNdWNISnZjSE5iSjI5dUp5QXJJR0ZqZEdsdmJsMHBJSHRjYmk4dklDQWdJQ0FnSUhSb2FYTXVjSEp2Y0hOYkoyOXVKeUFySUdGamRHbHZibDBvYVc1bWJ5azdYRzR2THlBZ0lDQWdmVnh1THk4Z0lDQjlMRnh1THk5Y2JpOHZJQ0FnTHk4Z1VtVnVaR1Z5SUhSb1pTQjNjbUZ3Y0dWeUlHTnZiWEJ2Ym1WdWRDQW9ZbmtnYW5WemRDQmtaV3hsWjJGMGFXNW5JSFJ2SUhSb1pTQnRZV2x1SUdOdmJYQnZibVZ1ZENrdVhHNHZMeUFnSUhKbGJtUmxjam9nWm5WdVkzUnBiMjRnS0NrZ2UxeHVMeTljYmk4dklDQWdJQ0IyWVhJZ1kyOXVabWxuSUQwZ2RHaHBjeTV3Y205d2N5NWpiMjVtYVdjZ2ZId2daR1ZtWVhWc2RFTnZibVpwWnp0Y2JpOHZJQ0FnSUNCMllYSWdkbUZzZFdVZ1BTQjBhR2x6TG5OMFlYUmxMblpoYkhWbE8xeHVMeTljYmk4dklDQWdJQ0JwWmlBb2RHaHBjeTV6ZEdGMFpTNXBjME52Ym5SeWIyeHNaV1FwSUh0Y2JpOHZJQ0FnSUNBZ0lHbG1JQ2doZEdocGN5NXdjbTl3Y3k1dmJrTm9ZVzVuWlNrZ2UxeHVMeThnSUNBZ0lDQWdJQ0JqYjI1emIyeGxMbXh2WnlnbldXOTFJSE5vYjNWc1pDQnpkWEJ3YkhrZ1lXNGdiMjVEYUdGdVoyVWdhR0Z1Wkd4bGNpQnBaaUI1YjNVZ2MzVndjR3g1SUdFZ2RtRnNkV1V1SnlrN1hHNHZMeUFnSUNBZ0lDQjlYRzR2THlBZ0lDQWdmVnh1THk5Y2JpOHZJQ0FnSUNCMllYSWdjSEp2Y0hNZ1BTQjdYRzR2THlBZ0lDQWdJQ0JqYjI1bWFXYzZJR052Ym1acFp5eGNiaTh2SUNBZ0lDQWdJQzh2SUVGc2JHOTNJR1pwWld4a0lIUmxiWEJzWVhSbGN5QjBieUJpWlNCd1lYTnpaV1FnYVc0Z1lYTWdZR1pwWld4a1lDQnZjaUJnWm1sbGJHUnpZQzRnUVdaMFpYSWdkR2hwY3l3Z2MzUnZjRnh1THk4Z0lDQWdJQ0FnTHk4Z1kyRnNiR2x1WnlCMGFHVnRJR1pwWld4a2N5NWNiaTh2SUNBZ0lDQWdJR1pwWld4a1ZHVnRjR3hoZEdVNklIUm9hWE11Y0hKdmNITXVabWxsYkdRc1hHNHZMeUFnSUNBZ0lDQm1hV1ZzWkZSbGJYQnNZWFJsY3pvZ2RHaHBjeTV3Y205d2N5NW1hV1ZzWkhNc1hHNHZMeUFnSUNBZ0lDQjJZV3gxWlRvZ2RtRnNkV1VzWEc0dkx5QWdJQ0FnSUNCdmJrTm9ZVzVuWlRvZ2RHaHBjeTV2YmtOb1lXNW5aU3hjYmk4dklDQWdJQ0FnSUc5dVFXTjBhVzl1T2lCMGFHbHpMbTl1UVdOMGFXOXVYRzR2THlBZ0lDQWdmVHRjYmk4dlhHNHZMeUFnSUNBZ1h5NWxZV05vS0hSb2FYTXVjSEp2Y0hNc0lHWjFibU4wYVc5dUlDaHdjbTl3Vm1Gc2RXVXNJR3RsZVNrZ2UxeHVMeThnSUNBZ0lDQWdhV1lnS0NFb2EyVjVJR2x1SUhCeWIzQnpLU2tnZTF4dUx5OGdJQ0FnSUNBZ0lDQndjbTl3YzF0clpYbGRJRDBnY0hKdmNGWmhiSFZsTzF4dUx5OGdJQ0FnSUNBZ2ZWeHVMeThnSUNBZ0lIMHBPMXh1THk5Y2JpOHZJQ0FnSUNCeVpYUjFjbTRnUm05eWJXRjBhV05EYjI1MGNtOXNiR1ZrS0hCeWIzQnpLVHRjYmk4dklDQWdmVnh1THk5Y2JpOHZJSDBwTzF4dUlsMTkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhvYmosIGtleXMpIHsgdmFyIHRhcmdldCA9IHt9OyBmb3IgKHZhciBpIGluIG9iaikgeyBpZiAoa2V5cy5pbmRleE9mKGkpID49IDApIGNvbnRpbnVlOyBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGkpKSBjb250aW51ZTsgdGFyZ2V0W2ldID0gb2JqW2ldOyB9IHJldHVybiB0YXJnZXQ7IH1cblxudmFyIF9yZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydSZWFjdCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnUmVhY3QnXSA6IG51bGwpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF91bmRhc2ggPSByZXF1aXJlKCcuL3VuZGFzaCcpO1xuXG52YXIgX3VuZGFzaDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF91bmRhc2gpO1xuXG52YXIgY2xvbmVDaGlsZCA9IGZ1bmN0aW9uIGNsb25lQ2hpbGQoY2hpbGRyZW4sIHByb3BzKSB7XG5cbiAgaWYgKF91bmRhc2gyWydkZWZhdWx0J10uaXNGdW5jdGlvbihjaGlsZHJlbikpIHtcbiAgICByZXR1cm4gY2hpbGRyZW4ocHJvcHMpO1xuICB9XG5cbiAgaWYgKF91bmRhc2gyWydkZWZhdWx0J10uaXNOdWxsKGNoaWxkcmVuKSB8fCBfdW5kYXNoMlsnZGVmYXVsdCddLmlzVW5kZWZpbmVkKGNoaWxkcmVuKSkge1xuICAgIGlmIChwcm9wcy5vblJlbmRlcikge1xuICAgICAgdmFyIG9uUmVuZGVyID0gcHJvcHMub25SZW5kZXI7XG5cbiAgICAgIHZhciBvdGhlclByb3BzID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKHByb3BzLCBbJ29uUmVuZGVyJ10pO1xuXG4gICAgICByZXR1cm4gb25SZW5kZXIob3RoZXJQcm9wcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgY2hpbGQgPSBfcmVhY3QyWydkZWZhdWx0J10uQ2hpbGRyZW4ub25seShjaGlsZHJlbik7XG5cbiAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jbG9uZUVsZW1lbnQoY2hpbGQsIHByb3BzKTtcbn07XG5cbmV4cG9ydHMuY2xvbmVDaGlsZCA9IGNsb25lQ2hpbGQ7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSWk5VmMyVnljeTlxZFhOMGFXNHZaMmwwTDJadmNtMWhkR2xqTDJ4cFlpOXlaV0ZqZEMxMWRHbHNjeTVxY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pT3pzN096czdPenM3T3p0eFFrRkJhMElzVDBGQlR6czdPenR6UWtGRFdDeFZRVUZWT3pzN08wRkJSWGhDTEVsQlFVMHNWVUZCVlN4SFFVRkhMRk5CUVdJc1ZVRkJWU3hEUVVGSkxGRkJRVkVzUlVGQlJTeExRVUZMTEVWQlFVczdPMEZCUlhSRExFMUJRVWtzYjBKQlFVVXNWVUZCVlN4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRk8wRkJRekZDTEZkQlFVOHNVVUZCVVN4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRE8wZEJRM2hDT3p0QlFVVkVMRTFCUVVrc2IwSkJRVVVzVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4SlFVRkpMRzlDUVVGRkxGZEJRVmNzUTBGQlF5eFJRVUZSTEVOQlFVTXNSVUZCUlR0QlFVTnFSQ3hSUVVGSkxFdEJRVXNzUTBGQlF5eFJRVUZSTEVWQlFVVTdWVUZEV0N4UlFVRlJMRWRCUVcxQ0xFdEJRVXNzUTBGQmFFTXNVVUZCVVRzN1ZVRkJTeXhWUVVGVkxEUkNRVUZKTEV0QlFVczdPMEZCUTNaRExHRkJRVThzVVVGQlVTeERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRPMHRCUXpkQ096dEJRVVZFTEZkQlFVOHNTVUZCU1N4RFFVRkRPMGRCUTJJN08wRkJSVVFzVFVGQlRTeExRVUZMTEVkQlFVY3NiVUpCUVUwc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXpzN1FVRkZOVU1zVTBGQlR5eHRRa0ZCVFN4WlFVRlpMRU5CUVVNc1MwRkJTeXhGUVVGRkxFdEJRVXNzUTBGQlF5eERRVUZETzBOQlEzcERMRU5CUVVNN08xRkJSMEVzVlVGQlZTeEhRVUZXTEZWQlFWVWlMQ0ptYVd4bElqb2laMlZ1WlhKaGRHVmtMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE5EYjI1MFpXNTBJanBiSW1sdGNHOXlkQ0JTWldGamRDQm1jbTl0SUNkeVpXRmpkQ2M3WEc1cGJYQnZjblFnZFNCbWNtOXRJQ2N1TDNWdVpHRnphQ2M3WEc1Y2JtTnZibk4wSUdOc2IyNWxRMmhwYkdRZ1BTQW9ZMmhwYkdSeVpXNHNJSEJ5YjNCektTQTlQaUI3WEc1Y2JpQWdhV1lnS0hVdWFYTkdkVzVqZEdsdmJpaGphR2xzWkhKbGJpa3BJSHRjYmlBZ0lDQnlaWFIxY200Z1kyaHBiR1J5Wlc0b2NISnZjSE1wTzF4dUlDQjlYRzVjYmlBZ2FXWWdLSFV1YVhOT2RXeHNLR05vYVd4a2NtVnVLU0I4ZkNCMUxtbHpWVzVrWldacGJtVmtLR05vYVd4a2NtVnVLU2tnZTF4dUlDQWdJR2xtSUNod2NtOXdjeTV2YmxKbGJtUmxjaWtnZTF4dUlDQWdJQ0FnWTI5dWMzUWdlMjl1VW1WdVpHVnlMQ0F1TGk1dmRHaGxjbEJ5YjNCemZTQTlJSEJ5YjNCek8xeHVJQ0FnSUNBZ2NtVjBkWEp1SUc5dVVtVnVaR1Z5S0c5MGFHVnlVSEp2Y0hNcE8xeHVJQ0FnSUgxY2JseHVJQ0FnSUhKbGRIVnliaUJ1ZFd4c08xeHVJQ0I5WEc1Y2JpQWdZMjl1YzNRZ1kyaHBiR1FnUFNCU1pXRmpkQzVEYUdsc1pISmxiaTV2Ym14NUtHTm9hV3hrY21WdUtUdGNibHh1SUNCeVpYUjFjbTRnVW1WaFkzUXVZMnh2Ym1WRmJHVnRaVzUwS0dOb2FXeGtMQ0J3Y205d2N5azdYRzU5TzF4dVhHNWxlSEJ2Y25RZ2UxeHVJQ0JqYkc5dVpVTm9hV3hrWEc1OU8xeHVJbDE5IiwidmFyIF8gPSB7fTtcblxuXy5hc3NpZ24gPSBfLmV4dGVuZCA9IHJlcXVpcmUoJ29iamVjdC1hc3NpZ24nKTtcbl8uaXNFcXVhbCA9IHJlcXVpcmUoJ2RlZXAtZXF1YWwnKTtcblxuLy8gVGhlc2UgYXJlIG5vdCBuZWNlc3NhcmlseSBjb21wbGV0ZSBpbXBsZW1lbnRhdGlvbnMuIFRoZXkncmUganVzdCBlbm91Z2ggZm9yXG4vLyB3aGF0J3MgdXNlZCBpbiBmb3JtYXRpYy5cblxuXy5mbGF0dGVuID0gKGFycmF5cykgPT4gW10uY29uY2F0LmFwcGx5KFtdLCBhcnJheXMpO1xuXG5fLmlzU3RyaW5nID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbl8uaXNVbmRlZmluZWQgPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnO1xuXy5pc09iamVjdCA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCc7XG5fLmlzQXJyYXkgPSB2YWx1ZSA9PiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBBcnJheV0nO1xuXy5pc051bWJlciA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcic7XG5fLmlzQm9vbGVhbiA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nO1xuXy5pc051bGwgPSB2YWx1ZSA9PiB2YWx1ZSA9PT0gbnVsbDtcbl8uaXNGdW5jdGlvbiA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcblxuXy5jbG9uZSA9IHZhbHVlID0+IHtcbiAgaWYgKCFfLmlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZXR1cm4gXy5pc0FycmF5KHZhbHVlKSA/IHZhbHVlLnNsaWNlKCkgOiBfLmFzc2lnbih7fSwgdmFsdWUpO1xufTtcblxuXy5maW5kID0gKGl0ZW1zLCB0ZXN0Rm4pID0+IHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgIGlmICh0ZXN0Rm4oaXRlbXNbaV0pKSB7XG4gICAgICByZXR1cm4gaXRlbXNbaV07XG4gICAgfVxuICB9XG4gIHJldHVybiB2b2lkIDA7XG59O1xuXG5fLmV2ZXJ5ID0gKGl0ZW1zLCB0ZXN0Rm4pID0+IHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgIGlmICghdGVzdEZuKGl0ZW1zW2ldKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbl8uZWFjaCA9IChvYmosIGl0ZXJhdGVGbikgPT4ge1xuICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goa2V5ID0+IHtcbiAgICBpdGVyYXRlRm4ob2JqW2tleV0sIGtleSk7XG4gIH0pO1xufTtcblxuXy5vYmplY3QgPSAoYXJyYXkpID0+IHtcbiAgY29uc3Qgb2JqID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChwYWlyID0+IHtcbiAgICBvYmpbcGFpclswXV0gPSBwYWlyWzFdO1xuICB9KTtcblxuICByZXR1cm4gb2JqO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBfO1xuIiwidmFyIHBTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBvYmplY3RLZXlzID0gcmVxdWlyZSgnLi9saWIva2V5cy5qcycpO1xudmFyIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9saWIvaXNfYXJndW1lbnRzLmpzJyk7XG5cbnZhciBkZWVwRXF1YWwgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhY3R1YWwsIGV4cGVjdGVkLCBvcHRzKSB7XG4gIGlmICghb3B0cykgb3B0cyA9IHt9O1xuICAvLyA3LjEuIEFsbCBpZGVudGljYWwgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbiAgaWYgKGFjdHVhbCA9PT0gZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcblxuICB9IGVsc2UgaWYgKGFjdHVhbCBpbnN0YW5jZW9mIERhdGUgJiYgZXhwZWN0ZWQgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5nZXRUaW1lKCkgPT09IGV4cGVjdGVkLmdldFRpbWUoKTtcblxuICAvLyA3LjMuIE90aGVyIHBhaXJzIHRoYXQgZG8gbm90IGJvdGggcGFzcyB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcsXG4gIC8vIGVxdWl2YWxlbmNlIGlzIGRldGVybWluZWQgYnkgPT0uXG4gIH0gZWxzZSBpZiAoIWFjdHVhbCB8fCAhZXhwZWN0ZWQgfHwgdHlwZW9mIGFjdHVhbCAhPSAnb2JqZWN0JyAmJiB0eXBlb2YgZXhwZWN0ZWQgIT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gb3B0cy5zdHJpY3QgPyBhY3R1YWwgPT09IGV4cGVjdGVkIDogYWN0dWFsID09IGV4cGVjdGVkO1xuXG4gIC8vIDcuNC4gRm9yIGFsbCBvdGhlciBPYmplY3QgcGFpcnMsIGluY2x1ZGluZyBBcnJheSBvYmplY3RzLCBlcXVpdmFsZW5jZSBpc1xuICAvLyBkZXRlcm1pbmVkIGJ5IGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoYXMgdmVyaWZpZWRcbiAgLy8gd2l0aCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwpLCB0aGUgc2FtZSBzZXQgb2Yga2V5c1xuICAvLyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSwgZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5XG4gIC8vIGNvcnJlc3BvbmRpbmcga2V5LCBhbmQgYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LiBOb3RlOiB0aGlzXG4gIC8vIGFjY291bnRzIGZvciBib3RoIG5hbWVkIGFuZCBpbmRleGVkIHByb3BlcnRpZXMgb24gQXJyYXlzLlxuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmpFcXVpdihhY3R1YWwsIGV4cGVjdGVkLCBvcHRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZE9yTnVsbCh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gaXNCdWZmZXIgKHgpIHtcbiAgaWYgKCF4IHx8IHR5cGVvZiB4ICE9PSAnb2JqZWN0JyB8fCB0eXBlb2YgeC5sZW5ndGggIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIGlmICh0eXBlb2YgeC5jb3B5ICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB4LnNsaWNlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh4Lmxlbmd0aCA+IDAgJiYgdHlwZW9mIHhbMF0gIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBvYmpFcXVpdihhLCBiLCBvcHRzKSB7XG4gIHZhciBpLCBrZXk7XG4gIGlmIChpc1VuZGVmaW5lZE9yTnVsbChhKSB8fCBpc1VuZGVmaW5lZE9yTnVsbChiKSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS5cbiAgaWYgKGEucHJvdG90eXBlICE9PSBiLnByb3RvdHlwZSkgcmV0dXJuIGZhbHNlO1xuICAvL35+fkkndmUgbWFuYWdlZCB0byBicmVhayBPYmplY3Qua2V5cyB0aHJvdWdoIHNjcmV3eSBhcmd1bWVudHMgcGFzc2luZy5cbiAgLy8gICBDb252ZXJ0aW5nIHRvIGFycmF5IHNvbHZlcyB0aGUgcHJvYmxlbS5cbiAgaWYgKGlzQXJndW1lbnRzKGEpKSB7XG4gICAgaWYgKCFpc0FyZ3VtZW50cyhiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhID0gcFNsaWNlLmNhbGwoYSk7XG4gICAgYiA9IHBTbGljZS5jYWxsKGIpO1xuICAgIHJldHVybiBkZWVwRXF1YWwoYSwgYiwgb3B0cyk7XG4gIH1cbiAgaWYgKGlzQnVmZmVyKGEpKSB7XG4gICAgaWYgKCFpc0J1ZmZlcihiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yIChpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhW2ldICE9PSBiW2ldKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHRyeSB7XG4gICAgdmFyIGthID0gb2JqZWN0S2V5cyhhKSxcbiAgICAgICAga2IgPSBvYmplY3RLZXlzKGIpO1xuICB9IGNhdGNoIChlKSB7Ly9oYXBwZW5zIHdoZW4gb25lIGlzIGEgc3RyaW5nIGxpdGVyYWwgYW5kIHRoZSBvdGhlciBpc24ndFxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGtleXMgaW5jb3Jwb3JhdGVzXG4gIC8vIGhhc093blByb3BlcnR5KVxuICBpZiAoa2EubGVuZ3RoICE9IGtiLmxlbmd0aClcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vdGhlIHNhbWUgc2V0IG9mIGtleXMgKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksXG4gIGthLnNvcnQoKTtcbiAga2Iuc29ydCgpO1xuICAvL35+fmNoZWFwIGtleSB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKGthW2ldICE9IGtiW2ldKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5IGNvcnJlc3BvbmRpbmcga2V5LCBhbmRcbiAgLy9+fn5wb3NzaWJseSBleHBlbnNpdmUgZGVlcCB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAga2V5ID0ga2FbaV07XG4gICAgaWYgKCFkZWVwRXF1YWwoYVtrZXldLCBiW2tleV0sIG9wdHMpKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHR5cGVvZiBhID09PSB0eXBlb2YgYjtcbn1cbiIsInZhciBzdXBwb3J0c0FyZ3VtZW50c0NsYXNzID0gKGZ1bmN0aW9uKCl7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJndW1lbnRzKVxufSkoKSA9PSAnW29iamVjdCBBcmd1bWVudHNdJztcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gc3VwcG9ydHNBcmd1bWVudHNDbGFzcyA/IHN1cHBvcnRlZCA6IHVuc3VwcG9ydGVkO1xuXG5leHBvcnRzLnN1cHBvcnRlZCA9IHN1cHBvcnRlZDtcbmZ1bmN0aW9uIHN1cHBvcnRlZChvYmplY3QpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpID09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xufTtcblxuZXhwb3J0cy51bnN1cHBvcnRlZCA9IHVuc3VwcG9ydGVkO1xuZnVuY3Rpb24gdW5zdXBwb3J0ZWQob2JqZWN0KXtcbiAgcmV0dXJuIG9iamVjdCAmJlxuICAgIHR5cGVvZiBvYmplY3QgPT0gJ29iamVjdCcgJiZcbiAgICB0eXBlb2Ygb2JqZWN0Lmxlbmd0aCA9PSAnbnVtYmVyJyAmJlxuICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsICdjYWxsZWUnKSAmJlxuICAgICFPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwob2JqZWN0LCAnY2FsbGVlJykgfHxcbiAgICBmYWxzZTtcbn07XG4iLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2YgT2JqZWN0LmtleXMgPT09ICdmdW5jdGlvbidcbiAgPyBPYmplY3Qua2V5cyA6IHNoaW07XG5cbmV4cG9ydHMuc2hpbSA9IHNoaW07XG5mdW5jdGlvbiBzaGltIChvYmopIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikga2V5cy5wdXNoKGtleSk7XG4gIHJldHVybiBrZXlzO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBUb09iamVjdCh2YWwpIHtcblx0aWYgKHZhbCA9PSBudWxsKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0LmFzc2lnbiBjYW5ub3QgYmUgY2FsbGVkIHdpdGggbnVsbCBvciB1bmRlZmluZWQnKTtcblx0fVxuXG5cdHJldHVybiBPYmplY3QodmFsKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZSkge1xuXHR2YXIgZnJvbTtcblx0dmFyIGtleXM7XG5cdHZhciB0byA9IFRvT2JqZWN0KHRhcmdldCk7XG5cblx0Zm9yICh2YXIgcyA9IDE7IHMgPCBhcmd1bWVudHMubGVuZ3RoOyBzKyspIHtcblx0XHRmcm9tID0gYXJndW1lbnRzW3NdO1xuXHRcdGtleXMgPSBPYmplY3Qua2V5cyhPYmplY3QoZnJvbSkpO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0b1trZXlzW2ldXSA9IGZyb21ba2V5c1tpXV07XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRvO1xufTtcbiJdfQ==
