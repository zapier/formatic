//CUT
import React from 'react';
import Formatic from 'formatic';

const fields = [];
const pluginA = () => ({});
const pluginB = () => ({});
const pluginC = () => ({});
//CUT
const config = Formatic.createConfig(pluginA, pluginB, pluginC);

React.render(<Formatic fields={fields} config={config} />, document.body);
