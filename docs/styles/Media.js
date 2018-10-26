const withWidthCallback = (min, max, cb) => {
  if (typeof cb === 'function') {
    return cb(min, max);
  }
  if (typeof cb === 'undefined') {
    return {};
  }
  return cb;
};

export const getStyleForWidth = (narrow, medium, large, xlarge) => {
  return {
    ...withWidthCallback(0, 768, narrow),
    '@media (min-width: 768px)': withWidthCallback(768, 992, medium),
    '@media (min-width: 992px)': withWidthCallback(992, 1200, large),
    '@media (min-width: 1200px)': withWidthCallback(1200, Infinity, xlarge),
  };
};
