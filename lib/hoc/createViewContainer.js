import createWrapper from './createWrapper';

const createViewContainer = name => createWrapper(name, `${name}View`);

export default createViewContainer;
