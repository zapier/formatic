import React from 'react';

const styles = {
  subSection: () => ({}),
};

const SubSection = props => (
  <div css={styles.subSection(props)}>
    <h3>{props.title}</h3>
    <div>{props.children}</div>
  </div>
);

export default SubSection;
