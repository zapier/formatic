import React, { useContext } from 'react';

import { RenderContext } from '@/src/future/context';

export default function Component({
  _component: RenderComponent,
  _key,
  ...props
}) {
  const renderContext = useContext(RenderContext);
  if (!renderContext.renderComponent) {
    return <RenderComponent {...props} />;
  }
  return renderContext.renderComponent(
    _key || RenderComponent.displayName || RenderComponent.name,
    RenderComponent,
    props
  );
}
