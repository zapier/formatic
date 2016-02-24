import flow from 'lodash/fp/flow';
import filter from 'lodash/fp/filter';
import map from 'lodash/fp/map';

import createDomInput from '../hoc/createDomInput';

export default createDomInput('SelectMultiple', {
  getValueFromEvent: event => (
    flow(
      filter(option => option.selected),
      map(option => option.value)
    )(event.target.options)
  ),
  getProps: ({options}) => ({options})
});
