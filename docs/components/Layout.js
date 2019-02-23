import React from 'react';

import NavMenu from './NavMenu';
import Header from './Header';
import Container from './Container';
import Footer from './Footer';

const Layout = props => {
  const page = props.pages[props.pageKey] || {};
  return (
    <div>
      <NavMenu pageKey={props.pageKey} pages={props.pages} />
      <Header {...page} />
      <Container>{props.children}</Container>
      <Footer />
    </div>
  );
};

export default Layout;
