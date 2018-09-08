import React from 'react';

import Icon from './Icon';

import { dashify } from '../utils';

const styles = {
  section: () => ({}),
  link: () => ({
    paddingLeft: 5,
  }),
};

const Section = props => (
  <div css={styles.section(props)}>
    <h3>
      {props.title}
      <a css={styles.link(props)} href={`#${dashify(props.title)}`}>
        <Icon name="link" />
      </a>
    </h3>
    <div>{props.children}</div>
  </div>
);

export default Section;
