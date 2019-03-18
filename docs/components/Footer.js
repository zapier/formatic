/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import Container from './Container';
import Colors from '@/docs/styles/Colors';

const styles = {
  footer: css({
    marginTop: 100,
    borderTop: `1px solid ${Colors.neutral[5]}`,
    paddingTop: 40,
    paddingBottom: 40,
  }),
  content: css({
    textAlign: 'center',
  }),
};

const Header = () => (
  <footer css={styles.footer} role="contentinfo">
    <Container>
      <p css={styles.content}>
        Code licensed by{' '}
        <a href="https://github.com/zapier/formatic/blob/master/LICENSE">
          Zapier Inc.
        </a>
      </p>
    </Container>
  </footer>
);

export default Header;
