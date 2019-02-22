/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import Icon from './Icon';

import { dashify } from '../utils';
import Typography from '../styles/Typography';

import LinkIcon from '../../static/icons/link.svg';

const styles = {
  section: css({}),
  sectionHead: css({
    ...Typography['main-head'],
  }),
  link: css({
    paddingLeft: 5,
  }),
};

const Section = props => (
  <div css={styles.section}>
    <h2 css={styles.sectionHead}>
      {props.title}
      <a css={styles.link} href={`#${dashify(props.title)}`}>
        <Icon svg={LinkIcon} />
      </a>
    </h2>
    <div>{props.children}</div>
  </div>
);

export default Section;
