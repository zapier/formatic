import React from 'react';

const Code = props => (
  <code
    css={{
      padding: '2px 4px',
      color: '#c7254e',
      backgroundColor: '#f9f2f4',
      borderRadius: 4,
    }}
  >
    {props.children}
  </code>
);

export default Code;
