/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import Colors from '@/docs/styles/Colors';

const styles = {
  example: css({
    border: `1px solid ${Colors.neutral[4]}`,
    padding: 20,
    borderRadius: 3,
  }),
};

const Example = props => <div css={styles.example}>{props.children}</div>;

export default Example;
