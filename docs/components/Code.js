/** @jsx jsx */
import { jsx, css } from '@emotion/core';

const styles = {
  code: css({
    padding: '2px 4px',
    color: '#c7254e',
    backgroundColor: '#f9f2f4',
    borderRadius: 4,
  }),
};

const Code = props => <code css={styles.code}>{props.children}</code>;

export default Code;
