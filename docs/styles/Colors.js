import { darken, getLuminance } from 'polished';

const Base = {
  neutral: {
    0: '#20272b',
    1: '#354147',
    2: '#5f6c72',
    3: '#969ea2',
    4: '#dadfe2',
    5: '#f1f4f5',
  },
  brand: {
    0: '#c63a00',
    1: '#ff4a00',
    2: '#ffa38c',
    3: '#ffd2bf',
  },
  main: {
    0: '#428ddb',
    1: '#499df3',
    2: '#add2fa',
    3: '#d1e6fc',
  },
};

const createThemeColor = spec => {
  // Add `type` property of "light" or "dark". Light colors may disappear
  // against a light background, so need to account for that in some
  // places.
  const type =
    getLuminance(spec.main) > getLuminance(spec.text) ? 'light' : 'dark';
  return {
    type,
    dark: darken(0.03, spec.main),
    ...spec,
  };
};

const Colors = {
  ...Base,

  // Semantic
  theme: {
    primary: createThemeColor({
      main: Base.main[1],
      text: 'white',
      border: 'transparent',
    }),
    secondary: createThemeColor({
      main: Base.neutral[5],
      text: Base.neutral[1],
      border: Base.neutral[4],
    }),
    important: createThemeColor({
      main: Base.brand[1],
      text: 'white',
      border: 'transparent',
    }),
  },
};

export default Colors;
