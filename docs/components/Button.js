/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import Colors from '@/docs/styles/Colors';

const getTag = props => {
  if (props.isDisabled) {
    return 'button';
  }
  if (props.href) {
    return 'a';
  }
  return 'button';
};

const getButtonCss = props =>
  css(
    {
      alignItems: 'center',
      appearance: 'none',
      backgroundColor: Colors.theme[props.color].main,
      borderColor: Colors.theme[props.color].border,
      borderRadius: 4,
      borderWidth: 1,
      borderStyle: 'solid',
      boxSizing: 'border-box',
      color: Colors.theme[props.color].text,
      cursor: 'pointer',
      display: 'inline-flex',
      fontFamily: 'sans-serif',
      justifyContent: 'center',
      minWidth: 0,
      padding: '1em',
      textAlign: 'center',
      textDecoration: 'none',
      textTransform: 'none',
      transition: 'all 0.1s ease-in-out',
      verticalAlign: 'middle',
      whiteSpace: 'nowrap',
      width: 'auto',
      '&:focus:not([disabled]), &:hover:not([disabled])': {
        backgroundColor: Colors.theme[props.color].dark,
        color: Colors.theme[props.color].text,
      },
      '&::-moz-focus-inner': {
        padding: 0,
        border: 0,
      },
      '&[disabled]': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
    props.size === 'small' && {
      fontSize: 12,
      height: 18,
      lineHeight: '16px',
      padding: '0 4px',
    },
    props.size === 'medium' && {
      fontSize: 13,
      lineHeight: 'normal',
    },
    props.size === 'large' && {
      fontSize: 15,
      lineHeight: 'normal',
    },
    props.casing === 'uppercase' && {
      textTransform: 'uppercase',
    },
    props.isFullWidth && {
      width: '100%',
    },
    props.isMinWidth && {
      minWidth: '9em',
    }
  );

export const Button = props => {
  const Tag = getTag(props);

  const { type, href, onClick, children } = props;

  return (
    <Tag
      {...{ type, href, onClick, disabled: props.isDisabled }}
      css={getButtonCss(props)}
    >
      {children}
    </Tag>
  );
};

Button.defaultProps = {
  color: 'secondary',
  size: 'medium',
  isDisabled: false,
  isFullWidth: false,
  isMinWidth: false,
};

export const PrimaryButton = props => <Button {...props} color="primary" />;

export const SecondaryButton = props => <Button {...props} color="secondary" />;

export default Button;
