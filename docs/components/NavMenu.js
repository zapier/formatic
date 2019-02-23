/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Toggle } from 'react-powerplug';

import { RawLink, NavLink } from './Link';
import Container from './Container';
import Icon from './Icon';
import Colors from '@/docs/styles/Colors';
import { getMediaQueriesForWidths } from '@/docs/styles/Media';

import MenuIcon from '@/static/icons/menu.svg';
import DeleteIcon from '@/static/icons/delete.svg';

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
    paddingLeft: 0,
    ...getMediaQueriesForWidths(
      {
        flex: 1,
      },
      {
        flex: 'initial',
      }
    ),
  }),
  brandLink: css({
    color: Colors.brand[1],
    textDecoration: 'none',
    '&:focus, &:hover': {
      textDecoration: 'none',
      color: Colors.brand[1],
    },
  }),
  items: css({
    padding: 0,
    margin: 0,
    ...getMediaQueriesForWidths(
      {
        display: 'none',
      },
      {
        display: 'flex',
      }
    ),
  }),
  menuItemsActive: css({
    width: '100%',
    backgroundColor: 'white',
    position: 'absolute',
    borderBottom: `1px solid ${Colors.neutral[4]}`,
    paddingLeft: 5,
    ...getMediaQueriesForWidths(
      {
        display: 'block',
      },
      {
        display: 'none',
      }
    ),
  }),
  menuItemsNotActive: css({
    display: 'none',
  }),
  item: css({
    padding: 10,
    borderBottom: `solid 3px rgb(0, 0, 0, 0)`,
    ...getMediaQueriesForWidths(
      {
        display: 'block',
      },
      {
        display: 'inline-block',
      }
    ),
  }),
  itemIsCurrent: css({
    ...getMediaQueriesForWidths(
      {},
      {
        borderBottom: `solid 3px ${Colors.main[1]}`,
      }
    ),
  }),
  toggle: css({
    borderWidth: 0,
    backgroundColor: 'white',
    ...getMediaQueriesForWidths(
      {},
      {
        display: 'none',
      }
    ),
  }),
};

const NavItem = props => {
  const title = props.navTitle || props.title;
  const target = /^https?:/.test(props.url) ? title : undefined;
  return (
    <li css={[styles.item, props.isCurrent && styles.itemIsCurrent]}>
      <NavLink href={props.url} isActive={props.isCurrent} target={target}>
        {props.navTitle || props.title}
      </NavLink>
    </li>
  );
};

const NavMenu = props => (
  <Toggle>
    {menuToggle => (
      <div>
        <div css={styles.navWrapper}>
          <Container>
            <nav css={styles.nav}>
              <div css={styles.brand}>
                <RawLink css={styles.brandLink} href="/">
                  Formatic
                </RawLink>
              </div>
              <ul css={styles.items}>
                {Object.keys(props.pages).map(pageKey => (
                  <NavItem
                    key={pageKey}
                    {...props.pages[pageKey]}
                    isCurrent={props.pageKey === pageKey}
                  />
                ))}
              </ul>
              <button css={styles.toggle} onClick={menuToggle.toggle}>
                {menuToggle.on ? (
                  <Icon svg={DeleteIcon} />
                ) : (
                  <Icon svg={MenuIcon} />
                )}
              </button>
            </nav>
          </Container>
        </div>
        <ul
          css={[
            styles.items,
            styles.menuItemsActive,
            !menuToggle.on && styles.menuItemsNotActive,
          ]}
        >
          {Object.keys(props.pages).map(pageKey => (
            <NavItem
              key={pageKey}
              {...props.pages[pageKey]}
              isCurrent={props.pageKey === pageKey}
            />
          ))}
        </ul>
      </div>
    )}
  </Toggle>
);

export default NavMenu;
