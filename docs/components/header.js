import React from 'react';

import Container from './Container';
import Colors from '../styles/Colors';

const styles = {
  leadHeader: () => ({
    borderBottom: `1px solid ${Colors.neutral[5]}`,
  }),
  header: () => ({
    borderBottom: `1px solid ${Colors.neutral[5]}`,
  }),
  logo: () => ({
    display: 'block',
    margin: '0 auto 30px',
    width: 200,
    height: 200,
  }),
  lead: () => ({
    textAlign: 'center',
    fontSize: 30,
  }),
  title: () => ({}),
  subTitle: () => ({}),
};

const Header = props =>
  !props.title ? (
    <div css={styles.leadHeader(props)}>
      <Container>
        <img
          css={styles.logo(props)}
          src="static/images/logo.png"
          alt="Formatic"
        />
        <p css={styles.lead(props)}>Automatic Forms for React</p>
      </Container>
    </div>
  ) : (
    <div css={styles.header(props)}>
      <Container>
        <h1 css={styles.title(props)}>{props.title}</h1>
        <p css={styles.subTitle(props)}>{props.subTitle}</p>
      </Container>
    </div>
  );

export default Header;
