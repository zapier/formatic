import React from 'react';
import Link from './Link';
import Colors from '../styles/Colors';

const styles = {
  nav: () => ({
    display: 'flex',
    borderBottom: `1px solid ${Colors.neutral[5]}`,
  }),
  brand: () => ({
    display: 'inline-block',
    padding: 10,
  }),
  items: () => ({
    display: 'flex',
    padding: 0,
  }),
  item: () => ({
    display: 'inline-block',
    padding: 10,
  }),
};

const NavItem = props => {
  const title = props.navTitle || props.title;
  const target = /^https?:/.test(props.url) ? title : undefined;
  return (
    <li css={styles.item(props)}>
      <Link target={target} href={props.url}>
        {props.navTitle || props.title}
      </Link>
    </li>
  );
};

const NavMenu = props => (
  <nav css={styles.nav(props)}>
    <div css={styles.brand(props)}>
      <Link href="/">Formatic</Link>
    </div>
    <ul css={styles.items(props)}>
      {Object.keys(props.pages).map(pageKey => (
        <NavItem {...props.pages[pageKey]} />
      ))}
    </ul>
  </nav>
);

export default NavMenu;
