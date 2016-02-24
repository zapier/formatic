import createDomInput from '../hoc/createDomInput';

export default createDomInput('Checkbox', {
  getValueFromEvent: event => event.target.checked
});
