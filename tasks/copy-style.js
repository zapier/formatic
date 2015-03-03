var sh = require('shelljs');

sh.mkdir('-p', './live');
sh.cp('-rf', './style', './live');
