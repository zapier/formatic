import React from 'react';

const Icon = props => (
  <span
    css={{ fontSize: '.75em' }}
    className={`glyphicon glyphicon-${props.name}`}
  />
);

export default Icon;
