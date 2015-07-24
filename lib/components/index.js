//const wrap = require('./wrap-component');
//const createField = require('./create-field');
//const createInput = require('./create-input');

module.exports = {
  UncontrolledContainer: require('./containers/uncontrolled'),
  //InputContainer: require('./containers/input') //,
  StringInput: require('./inputs/string')
  //StringField: require('./fields/string')
  // FieldsField: createField('Fields'),
  // StringField: createField('String'),
  // FieldsInput: wrap(require('./inputs/fields')),
  //StringInput: createInput('String')
  // Field: wrap(require('./helpers/field')),
  // Label: wrap(require('./helpers/label')),
  // Help: wrap(require('./helpers/help'))
};
