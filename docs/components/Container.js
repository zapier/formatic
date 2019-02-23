/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import { getMediaQueriesForWidths } from '@/docs/styles/Media';

const styles = {
  container: css({
    paddingRight: 15,
    paddingLeft: 15,
    marginRight: 'auto',
    marginLeft: 'auto',
    ...getMediaQueriesForWidths(
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
