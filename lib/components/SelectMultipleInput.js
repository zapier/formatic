import compose from 'recompose/compose';

import wrapInput from '../hoc/wrapInput';
import mapSomePropsOnChange from '../hoc/mapSomePropsOnChange';
import { normalizeOptions } from '../Utils';
import createViewContainer from '../hoc/createViewContainer';

const SelectInput = createViewContainer('SelectMultipleInput');

const cacheNormalizedOptions = mapSomePropsOnChange(
  ['options'],
  ({options}) => ({
    options: normalizeOptions(options)
  })
);

export default compose(
  cacheNormalizedOptions,
  wrapInput
)(SelectInput);
