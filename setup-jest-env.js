import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'jest-dom/extend-expect';

Enzyme.configure({ adapter: new Adapter() });

// React 16 needs `requestAnimationFrame` to work properly
global.requestAnimationFrame = function(callback) {
  setTimeout(callback, 0);
};
