/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import Container from './Container';
import Colors from '../styles/Colors';
import { getStyleForWidth } from '../styles/Media';

const styles = {
  header: css({
    borderBottom: `1px solid ${Colors.neutral[5]}`,
    marginBottom: 40,
    ...getStyleForWidth(
      {
        fontSize: 18,
        paddingTop: 20,
        paddingBottom: 20,
      },
      {
        fontSize: 24,
        paddingTop: 60,
        paddingBottom: 60,
      }
    ),
  }),
  leadHeader: css({}),
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
  title: css({
    ...getStyleForWidth(
      {
        fontSize: 30,
      },
      {
        fontSize: 60,
      }
    ),
  }),
  subTitle: css({}),
};

const Header = props =>
  !props.title ? (
    <div css={[styles.header, styles.leadHeader]}>
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
