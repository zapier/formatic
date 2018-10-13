/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import Icon from './Icon';

import { dashify } from '../utils';

const styles = {
  section: css({}),
  link: css({
    paddingLeft: 5,
  }),
};

const Section = props => (
  <div css={styles.section}>
    <h3>
      {props.title}
      <a css={styles.link} href={`#${dashify(props.title)}`}>
        <Icon name="link" />
      </a>
    </h3>
    <div>{props.children}</div>
  </div>
);

export default Section;
