import React from 'react';
import NextLink from 'next/link';

const Link = props => (
  <NextLink href={props.href}>
    <a {...props} />
  </NextLink>
);

export default Link;
