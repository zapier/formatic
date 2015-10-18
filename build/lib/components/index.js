'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

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

console.log(components);

_undash2['default'].extend(components, {
  ObjectContainer: _containersObject2['default'],
  Field: _helpersField2['default'],
  Help: _helpersHelp2['default'],
  Label: _helpersLabel2['default']
});

exports['default'] = components;
module.exports = exports['default'];