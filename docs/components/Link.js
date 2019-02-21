/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import NextLink from 'next/link';

import Colors from '../styles/Colors';
import { prefixHref } from '../utils';

const styles = {
  link: css({
    color: Colors.main[1],
  }),
  navLink: css({
    color: Colors.neutral[2],
    textDecoration: 'none',
    '&:focus, &:hover': {
      textDecoration: 'none',
      color: Colors.main[1],
    },
  }),
  navLinkIsActive: css({
    color: Colors.neutral[1],
  }),
};

export const RawLink = props => {
  const { href, ...linkProps } = props;

  return (
    <NextLink href={href} as={prefixHref(href)} passHref={true}>
      <a {...linkProps} />
    </NextLink>
  );
};

const Link = props => {
  const { isNav, isActive, href, ...linkProps } = props;
  const linkCss = css(
    styles.link,
    isNav && styles.navLink,
    isNav && isActive && styles.navLinkIsActive
  );
  return (
    <NextLink href={href} as={prefixHref(href)} passHref={true}>
      <a css={linkCss} {...linkProps} />
    </NextLink>
  );
};

export const NavLink = props => <Link isNav={true} {...props} />;

export default Link;
