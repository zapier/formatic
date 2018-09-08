import React from 'react';
import Layout from './Layout';

const pages = {
  start: {
    url: 'start',
    title: 'Getting Started',
    subTitle: 'Installing and using Formatic',
  },
  demo: {
    url: 'demo',
    title: 'Field Types',
    subTitle: 'The whole kitchen sink',
  },
  plugins: {
    url: 'plugins',
    navTitle: 'Plugins',
    title: 'Extending Formatic',
  },
  github: {
    url: 'http://github.com/zapier/formatic',
    title: 'GitHub',
  },
};

const Page = props => (
  <Layout pages={pages} pageKey={props.pageKey}>
    {props.children}
  </Layout>
);

export default Page;
