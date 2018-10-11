export const dashify = s => s.split(' ').join('-');

export const buildStyles = (name, styles) => {
  if (typeof name !== 'string') {
    styles = name;
    name = undefined;
  }
  return Object.keys(styles).reduce((result, key) => {
    const buildStyle = styles[key];
    const label = name ? `${name}__${key}` : key;
    if (typeof buildStyle === 'function') {
      result[key] = props => ({
        ...buildStyle(props),
        label,
      });
    } else {
      result[key] = () => ({
        ...buildStyle,
        label,
      });
    }
    return result;
  }, {});
};
