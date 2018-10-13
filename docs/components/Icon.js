/** @jsx jsx */
import { jsx, css } from '@emotion/core';

const styles = {
  icon: css({ fontSize: '.75em' }),
};

const Icon = props => (
  <span css={styles.icon} className={`glyphicon glyphicon-${props.name}`} />
);

export default Icon;
