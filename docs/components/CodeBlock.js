/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import { atomDark } from 'react-syntax-highlighter/styles/prism';

const styles = {
  codeBlock: css({
    fontSize: 14,
  }),
};

const CodeBlock = props => (
  <div css={styles.codeBlock}>
    <SyntaxHighlighter language={props.language || 'plain'} style={atomDark}>
      {props.children}
    </SyntaxHighlighter>
  </div>
);

export default CodeBlock;
