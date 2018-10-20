import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import { atomDark } from 'react-syntax-highlighter/styles/prism';

const CodeBlock = props => (
  <SyntaxHighlighter language={props.language || 'plain'} style={atomDark}>
    {props.children}
  </SyntaxHighlighter>
);

export default CodeBlock;
