import React from 'react';

import { dashify } from '../utils';

const Sections = props => (
  <div>
    <ul>
      {React.Children.map(props.children, child => (
        <li>
          <a href={`#${dashify(child.props.title)}`}>{child.props.title}</a>
        </li>
      ))}
    </ul>
    {React.Children.map(props.children, child => (
      <>
        <a name={dashify(child.props.title)}/>{child}
      </>
    ))}
  </div>
);

export default Sections;
