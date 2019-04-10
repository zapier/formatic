import React, { useContext } from 'react';

import { RenderContext } from '@/src/future/context';

const Tag = React.forwardRef(function Tag(
  { _tag: RenderTag, _key, _meta, ...props },
  ref
) {
  const renderContext = useContext(RenderContext);
  if (!renderContext.renderTag) {
    return <RenderTag {...props} ref={ref} />;
  }
  return renderContext.renderTag(
    _key,
    RenderTag,
    {
      ...props,
      ref,
    },
    _meta
  );
});

Tag.displayName = 'Tag';

export default Tag;
