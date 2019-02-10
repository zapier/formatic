import React from 'react';

const hasOwnProperty = Object.prototype.hasOwnProperty;

export default function jsx(type, props, children) {
  let renderTag;
  let metaProps;

  if (typeof type === 'string' && props != null) {
    const renderWith = props.renderWith;
    if (renderWith != null) {
      renderTag = renderWith.renderTag;
      if (typeof renderTag != 'function') {
        renderTag = null;
      } else {
        metaProps = renderWith.props || {};
      }
    }
  }

  if (!renderTag) {
    return React.createElement.apply(null, arguments);
  }

  const tagProps = {};

  let key;
  for (key in props) {
    if (hasOwnProperty.call(props, key) && key !== 'renderWith') {
      tagProps[key] = props[key];
    }
  }

  const argsLength = arguments.length;
  if (argsLength === 3) {
    tagProps.children = children;
  } else if (argsLength > 3) {
    const fragmentArgs = [React.Fragment, {}];
    for (let i = 2; i < argsLength; i++) {
      fragmentArgs[i] = arguments[i];
    }
    tagProps.children = React.createElement.apply(null, fragmentArgs);
  }

  return renderTag(type, tagProps, metaProps);
}
