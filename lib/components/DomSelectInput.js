import createDomInput from '../hoc/createDomInput';

export default createDomInput('Select', {
  getValueFromEvent: event => event.target.value,
  getProps: ({options}) => ({options})
});
