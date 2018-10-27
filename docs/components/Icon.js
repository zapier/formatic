/** @jsx jsx */
import { jsx, css } from '@emotion/core';

const styles = {
  icon: css({
    display: 'inline-block',
    width: 16,
    height: 16,
  }),
};

const Icon = props => {
  const SvgIcon = props.svg;
  return (
    <span css={styles.icon}>
      <SvgIcon />
    </span>
  );
};

export default Icon;
