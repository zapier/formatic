var sh = require('shelljs');

sh.mkdir('-p', './live/lib');
sh.cp('-rf', './build/formatic-dev.js', './live/lib');
