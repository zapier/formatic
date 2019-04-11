/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import Icon from './Icon';

import { dashify } from '@/docs/utils';
import Typography from '@/docs/styles/Typography';

import LinkIcon from '@/static/icons/link.svg';

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
    <h2 css={styles.sectionHead} id={dashify(props.title)}>
      {props.title}
      <a
        aria-label="example link"
        css={styles.link}
        href={`#${dashify(props.title)}`}
      >
        <Icon svg={LinkIcon} />
      </a>
    </h2>
    <div>{props.children}</div>
  </div>
);

export default Section;
