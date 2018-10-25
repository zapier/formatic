/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { RawLink, NavLink } from './Link';
import Container from './Container';
import Colors from '../styles/Colors';

const styles = {
  navWrapper: css({
    borderBottom: `1px solid ${Colors.neutral[4]}`,
  }),
  nav: css({
    display: 'flex',
    fontSize: 15,
    fontWeight: 600,
    color: Colors.neutral[0],
  }),
  brand: css({
    display: 'inline-block',
    padding: 10,
    fontSize: 18,
  }),
  brandLink: css({
    color: Colors.brand[1],
    '&:focus, &:hover': {
      textDecoration: 'none',
      color: Colors.brand[1],
    },
  }),
  items: css({
    display: 'flex',
    padding: 0,
    margin: 0,
  }),
  item: css({
    display: 'inline-block',
    padding: 10,
    borderBottom: `solid 3px rgb(0, 0, 0, 0)`,
  }),
  itemIsCurrent: css({
    borderBottom: `solid 3px ${Colors.main[1]}`,
  }),
};

const NavItem = props => {
  const title = props.navTitle || props.title;
  const target = /^https?:/.test(props.url) ? title : undefined;
  return (
    <li css={[styles.item, props.isCurrent && styles.itemIsCurrent]}>
      <NavLink target={target} href={props.url} isActive={props.isCurrent}>
        {props.navTitle || props.title}
      </NavLink>
    </li>
  );
};

const NavMenu = props => (
  <div css={styles.navWrapper}>
    <Container>
      <nav css={styles.nav}>
        <div css={styles.brand}>
          <RawLink href="/" css={styles.brandLink}>
            Formatic
          </RawLink>
        </div>
        <ul css={styles.items}>
          {Object.keys(props.pages).map(pageKey => (
            <NavItem
              {...props.pages[pageKey]}
              isCurrent={props.pageKey === pageKey}
            />
          ))}
        </ul>
      </nav>
    </Container>
  </div>
);

export default NavMenu;
