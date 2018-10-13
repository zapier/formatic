/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import Link from './Link';
import Colors from '../styles/Colors';

const styles = {
  nav: css({
    display: 'flex',
    borderBottom: `1px solid ${Colors.neutral[5]}`,
  }),
  brand: css({
    display: 'inline-block',
    padding: 10,
  }),
  items: css({
    display: 'flex',
    padding: 0,
  }),
  item: css({
    display: 'inline-block',
    padding: 10,
  }),
};

const NavItem = props => {
  const title = props.navTitle || props.title;
  const target = /^https?:/.test(props.url) ? title : undefined;
  return (
    <li css={styles.item}>
      <Link target={target} href={props.url}>
        {props.navTitle || props.title}
      </Link>
    </li>
  );
};

const NavMenu = props => (
  <nav css={styles.nav}>
    <div css={styles.brand}>
      <Link href="/">Formatic</Link>
    </div>
    <ul css={styles.items}>
      {Object.keys(props.pages).map(pageKey => (
        <NavItem {...props.pages[pageKey]} />
      ))}
    </ul>
  </nav>
);

export default NavMenu;
