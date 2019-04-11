/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import Container from './Container';
import Colors from '@/docs/styles/Colors';
import Typography from '@/docs/styles/Typography';
import { getMediaQueriesForWidths } from '@/docs/styles/Media';

const styles = {
  header: css({
    borderBottom: `1px solid ${Colors.neutral[5]}`,
    marginBottom: 40,
    ...getMediaQueriesForWidths(
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
    ...getMediaQueriesForWidths(
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
    <header css={[styles.header, styles.leadHeader]} role="banner">
      <Container>
        <img alt="Formatic" css={styles.logo} src="static/images/logo.png" />
        <p css={styles.lead}>Automatic Forms for React</p>
      </Container>
    </header>
  ) : (
    <header css={styles.header} role="banner">
      <Container>
        <h1 css={styles.title}>{props.title}</h1>
        <p css={styles.subTitle}>{props.subTitle}</p>
      </Container>
    </header>
  );

export default Header;
