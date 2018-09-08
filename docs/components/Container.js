import React from 'react';

const styles = {
  container: () => ({
    paddingRight: 15,
    paddingLeft: 15,
    marginRight: 'auto',
    marginLeft: 'auto',
  }),
};

const Container = props => (
  <div css={styles.container(props)}>{props.children}</div>
);

export default Container;
