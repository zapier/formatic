import React from 'react';
/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import styled from '@emotion/styled';

const labelCss = css(`
  border: 1px solid black;
`);

const RemoveItemButton = styled.button`
  color: red;
`;

const passwordCss = css(`
  color: red;
`);

// A helper function to render children inside other tags.
const renderChildren = children => {
  if (children.length > 1) {
    // Spread the children so we don't get key warnings.
    return React.createElement(React.Fragment, {}, ...children);
  }
  return children;
};

const plugin = config => {
  const { renderTag } = config;
  return {
    renderTag: (Tag, tagProps, metaProps, ...children) => {
      const { typeName, parentTypeName, elementName } = metaProps;
      if (typeName === 'Fields' && elementName === 'Label') {
        return (
          <Tag css={labelCss} {...tagProps}>
            {renderChildren(children)}
          </Tag>
        );
      }
      if (typeName === 'Password' && elementName === 'PasswordInput') {
        // We know there are no children here, so we can ignore them.
        return <Tag css={passwordCss} {...tagProps} />;
      }
      if (parentTypeName === 'Array' && elementName === 'RemoveItem') {
        // Pass through to original renderTag which will then call
        // React.createElement. That will in turn handle children correctly.
        return renderTag(RemoveItemButton, tagProps, ...children);
      }
      // Pass through other tags to the original renderTag method.
      return renderTag(Tag, tagProps, metaProps, ...children);
    },
  };
};
//CUT
console.info(plugin);
//CUT
