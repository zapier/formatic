import React from 'react';

import NavMenu from './NavMenu';
import Header from './Header';
import Container from './Container';

const Layout = props => {
  const page = props.pages[props.pageKey] || {};
  return (
    <div>
      <NavMenu pages={props.pages} pageKey={props.pageKey} />
      <Header {...page} />
      <Container>{props.children}</Container>
    </div>
  );
};

export default Layout;
