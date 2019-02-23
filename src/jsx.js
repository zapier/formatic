import React from 'react';

import { argumentsToArray } from '@/src/utils';

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

  if (arguments.length < 4) {
    return renderTag(type, tagProps, metaProps, children);
  }

  return renderTag.apply(
    null,
    argumentsToArray(arguments, 2, [type, tagProps, metaProps])
  );
}
