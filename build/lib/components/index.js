'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

var _provideContext = require('./provide-context');

var _provideContext2 = _interopRequireDefault(_provideContext);

var _inputsString = require('./inputs/string');

var _inputsString2 = _interopRequireDefault(_inputsString);

var _containersObject = require('./containers/object');

var _containersObject2 = _interopRequireDefault(_containersObject);

var _helpersField = require('./helpers/field');

var _helpersField2 = _interopRequireDefault(_helpersField);

var _helpersHelp = require('./helpers/help');

var _helpersHelp2 = _interopRequireDefault(_helpersHelp);

var _helpersLabel = require('./helpers/label');

var _helpersLabel2 = _interopRequireDefault(_helpersLabel);

var components = {
  StringInput: _inputsString2['default']
};

Object.keys(components).forEach(function (key) {
  var PureComponent = (0, _wrapPure2['default'])(components[key]);
  PureComponent.hasEvent = components[key].hasEvent;
  components[key] = (0, _wrapInput2['default'])(PureComponent);
});

Object.keys(components).forEach(function (key) {
  components['Child' + key] = (0, _wrapChildInput2['default'])(components[key]);
});

var inputTypes = ['String'];

components.WithContext = {};

inputTypes.forEach(function (inputType) {
  var InputComponent = components['' + inputType + 'Input'];
  var FieldComponent = (0, _createField2['default'])(InputComponent);
  components['' + inputType + 'Field'] = FieldComponent;
  components['Child' + inputType + 'Field'] = (0, _wrapChildInput2['default'])(FieldComponent);
  components.WithContext['' + inputType + 'Input'] = (0, _useContext2['default'])(InputComponent);
  components.WithContext['' + inputType + 'Field'] = (0, _useContext2['default'])(FieldComponent);
});

components.WithContext.ObjectContainer = (0, _provideContext2['default'])(_containersObject2['default'], {
  childContext: function childContext(props) {
    return {
      components: props.components
    };
  }
});

_undash2['default'].extend(components, {
  ObjectContainer: _containersObject2['default'],
  Field: _helpersField2['default'],
  Help: _helpersHelp2['default'],
  Label: _helpersLabel2['default']
});

exports['default'] = components;
module.exports = exports['default'];