// # help-text-placement plugin

/*
The help-text-placement plugin lets you control whether each input's help
text is placed before or after the input itself.

The valid `placement` options are 'before' and 'after'
*/

'use strict';

import React from 'react';

export default placement => (/* config */) => {
  return {
    createElement_FieldBody: React.createFactory(function(props) {
      return placement === 'after' ? (
        <React.Fragment>
          {props.label}
          {props.children}
          {props.help}
        </React.Fragment>
      ) : (
        <React.Fragment>
          {props.label}
          {props.help}
          {props.children}
        </React.Fragment>
      );
    }),
  };
};
