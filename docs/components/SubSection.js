/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import Typography from '@/docs/styles/Typography';

const styles = {
  subSection: css({}),
  subSectionHead: css({
    ...Typography['sub-head'],
  }),
};

const SubSection = props => (
  <div css={styles.subSection}>
    <h3 css={styles.subSectionHead}>{props.title}</h3>
    <div>{props.children}</div>
  </div>
);

export default SubSection;
