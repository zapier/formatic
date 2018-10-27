/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import Container from './Container';
import Colors from '../styles/Colors';
import Typography from '../styles/Typography';
import { getStyleForWidth } from '../styles/Media';

const styles = {
  header: css({
    borderBottom: `1px solid ${Colors.neutral[5]}`,
    marginBottom: 40,
    ...getStyleForWidth(
      {
        ...Typography['sub-head'],
        paddingTop: 20,
        paddingBottom: 20,
      },
      {
        ...Typography['main-head'],
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
    ...Typography['main-head'],
  }),
  title: css({
    ...getStyleForWidth(
      {
        ...Typography['main-head'],
      },
      {
        ...Typography['mega-head'],
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
