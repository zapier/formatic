/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import { getStyleForWidth } from '../styles/Media';

const styles = {
  container: css({
    paddingRight: 15,
    paddingLeft: 15,
    marginRight: 'auto',
    marginLeft: 'auto',
    ...getStyleForWidth(
      {},
      width => ({
        width: width - 30,
      }),
      width => ({
        width: width - 30,
      }),
      width => ({
        width: width - 30,
      })
    ),
  }),
};

const Container = props => <div css={styles.container}>{props.children}</div>;

export default Container;
