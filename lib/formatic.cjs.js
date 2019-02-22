import Formatic, * as namedExports from './formatic';

Object.keys(namedExports).forEach(key => {
  if (key !== 'default') {
    Formatic[key] = namedExports[key];
  }
});

export default Formatic;
