'use strict';

import React from 'react';

const FieldBody = props => {
  return (
    <React.Fragment>
      {props.label}
      {props.help}
      {props.children}
    </React.Fragment>
  );
};

export default FieldBody;
