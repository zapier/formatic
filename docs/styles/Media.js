// Use min/max width values to get the styles for that range.
const getMediaQueryForWidthRange = (min, max, cbOrStyle) => {
  // If we have a function, pass min/max to that and get back styles.
  if (typeof cbOrStyle === 'function') {
    return cbOrStyle(min, max);
  }
  // If it's undefined, we have no styles for that range.
  if (typeof cbOrStyle === 'undefined') {
    return {};
  }
  // Otherwise, just accept the hard-coded styles.
  return cbOrStyle;
};

// Given styles for 4 width ranges, give back media queries.
export const getMediaQueriesForWidths = (narrow, medium, large, xlarge) => {
  return {
    ...getMediaQueryForWidthRange(0, 768, narrow),
    '@media (min-width: 768px)': getMediaQueryForWidthRange(768, 992, medium),
    '@media (min-width: 992px)': getMediaQueryForWidthRange(992, 1200, large),
    '@media (min-width: 1200px)': getMediaQueryForWidthRange(
      1200,
      Infinity,
      xlarge
    ),
  };
};
