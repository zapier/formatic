import React from 'react';
import omit from 'lodash/fp/omit';
import pick from 'lodash/fp/pick';
import shallowEqual from '../shallowEqual';
import createHelper from 'recompose/createHelper';

const mapSomePropsOnChange = (depKeys, mapProps, Component) => {

  const MapSomePropsOnChange = React.createClass({

    getInitialState() {
      const { props } = this;
      const depProps = pick(depKeys, props);
      return {
        depProps,
        mappedProps: mapProps(depProps)
      };
    },

    componentWillReceiveProps(nextProps) {
      const { depProps } = this.state;
      const nextDepProps = pick(depKeys, nextProps);
      if (!shallowEqual(depProps, nextDepProps)) {
        this.setState({
          depProps: nextDepProps,
          mappedProps: mapProps(nextDepProps)
        });
      }
    },

    render() {

      const { props } = this;
      const { mappedProps } = this.state;

      const unmappedProps = omit(depKeys, props);

      return (
        <Component {...unmappedProps} {...mappedProps}/>
      );
    }
  });

  return MapSomePropsOnChange;

};

export default createHelper(mapSomePropsOnChange, 'mapSomePropsOnChange');
