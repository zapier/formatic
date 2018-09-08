import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/styles/hljs';

const CodeBlock = props => (
  <SyntaxHighlighter language={props.language || 'plain'} style={docco}>
    {props.children}
  </SyntaxHighlighter>
);

export default CodeBlock;
