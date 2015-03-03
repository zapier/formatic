var sh = require('shelljs');

sh.mkdir('-p', './live');
sh.cp('-f', './demo/*.html', './live');
