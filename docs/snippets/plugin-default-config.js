//CUT
import React from 'react';
import Formatic from 'formatic';

const fields = [];
//CUT
const config = Formatic.createConfig();

React.render(<Formatic config={config} fields={fields} />, document.body);
