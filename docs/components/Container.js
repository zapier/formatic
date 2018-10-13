/** @jsx jsx */
import { jsx, css } from '@emotion/core';

const styles = {
  container: css({
    paddingRight: 15,
    paddingLeft: 15,
    marginRight: 'auto',
    marginLeft: 'auto',
  }),
};

const Container = props => <div css={styles.container}>{props.children}</div>;

export default Container;
