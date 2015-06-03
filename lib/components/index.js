const wrapField = require('./wrap-field');
const wrapHelper = require('./wrap-helper');

module.exports = {
  fields: {
    Fields: wrapField(require('./fields/fields')),
    String: wrapField(require('./fields/string'))
  },
  helpers: {
    Field: wrapHelper(require('./helpers/field')),
    Label: wrapHelper(require('./helpers/label')),
    Help: wrapHelper(require('./helpers/help'))
  }
};
