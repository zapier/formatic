import React from 'react';

import defaultPlugin from './defaultPlugin';
import createComponents from './createComponents';

const defaultComponents = createComponents(defaultPlugin);

const Formatic = React.createClass({
  statics: {
    ...defaultComponents
  },

  render() {
    return null;
  }
});

export default Formatic;
