/** @jsx jsx */
import { jsx, css } from '@emotion/core';

const styles = {
  container: css({
    paddingRight: 15,
    paddingLeft: 15,
    marginRight: 'auto',
    marginLeft: 'auto',
    '@media (min-width: 768px)': {
      width: 750,
    },
    '@media (min-width: 992px)': {
      width: 970,
    },
    '@media (min-width: 1200px)': {
      width: 1170,
    },
  }),
};

const Container = props => <div css={styles.container}>{props.children}</div>;

export default Container;
