/** @jsx jsx */
import { jsx, css } from '@emotion/core';

const styles = {
  subSection: css({}),
};

const SubSection = props => (
  <div css={styles.subSection}>
    <h3>{props.title}</h3>
    <div>{props.children}</div>
  </div>
);

export default SubSection;
