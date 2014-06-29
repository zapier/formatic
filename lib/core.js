var core = {};

module.exports = core;

core.plugins = {
  type: require('./plugins/type')
};

core.types = {
  code: require('./types/code'),
  form: require('./types/form'),
  select: require('./types/select'),
  text: require('./types/text'),
  textarea: require('./types/text')
};

core.viewers = {
  react: require('./viewers/react')
};

core.views = {
  react: {
    code: require('./views/react/code'),
    form: require('./views/react/form'),
    select: require('./views/react/select'),
    text: require('./views/react/text'),
    textarea: require('./views/react/textarea')
  }
};

core.configs = {
  react: require('./configs/react'),
  zapier: require('./configs/zapier')
};
