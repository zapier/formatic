/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import Container from './Container';
import Colors from '../styles/Colors';

const styles = {
  leadHeader: css({
    borderBottom: `1px solid ${Colors.neutral[5]}`,
  }),
  header: css({
    borderBottom: `1px solid ${Colors.neutral[5]}`,
  }),
  logo: css({
    display: 'block',
    margin: '0 auto 30px',
    width: 200,
    height: 200,
  }),
  lead: css({
    textAlign: 'center',
    fontSize: 30,
  }),
  title: css({}),
  subTitle: css({}),
};

const Header = props =>
  !props.title ? (
    <div css={styles.leadHeader}>
      <Container>
        <img css={styles.logo} src="static/images/logo.png" alt="Formatic" />
        <p css={styles.lead}>Automatic Forms for React</p>
      </Container>
    </div>
  ) : (
    <div css={styles.header}>
      <Container>
        <h1 css={styles.title}>{props.title}</h1>
        <p css={styles.subTitle}>{props.subTitle}</p>
      </Container>
    </div>
  );

export default Header;
