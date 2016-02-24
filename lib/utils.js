import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
import curry from 'lodash/curry';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';

export const keysWithIndex = object => Object.keys(object)
  .map((key, i) => [key, i]);

const normalizeOption = (option, key) => {
  if (isObject(option)) {
    return option;
  }
  if (key) {
    return {
      value: key,
      label: option
    };
  }
  return {
    value: option,
    label: option
  };
};

export const normalizeOptions = flow(
  options => {
    if (!isObject(options)) {
      if (isString(options)) {
        return options.split(',');
      }
      return [];
    }
    return options;
  },
  options => {
    const isArrayOptions = Array.isArray(options);
    return map(
      key => normalizeOption(options[key], isArrayOptions ? undefined : key),
      Object.keys(options)
    );
  }
);

export const mapOptions = curry((optionFn, options) => {
  return flow(
    normalizeOptions,
    map(optionFn)
  )(options);
});
