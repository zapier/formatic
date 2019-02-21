//CUT
import React from 'react';
import Formatic from 'formatic';

const fields = [];
const plugin = () => ({});
//CUT
const config = Formatic.createConfig(plugin);

React.render(<Formatic fields={fields} config={config} />, document.body);
