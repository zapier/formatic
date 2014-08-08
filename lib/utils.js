/*global escape,unescape*/
'use strict';

//var _ = require('underscore');

var utils = {};

var nextWithAutoArgs = function (fn, fnArguments) {
  if (arguments.length === 2) {
    return fn.apply(this, fnArguments);
  } else {
    var args = Array.prototype.slice.call(arguments, 2);
    return fn.apply(this, args);
  }
};

utils.wrapFn = function (fn, wrappers) {
  wrappers = wrappers || [];

  if (typeof wrappers === 'function') {
    wrappers = [wrappers];
  }

  if (wrappers.length === 0) {
    return fn;
  }

  var nextFn = fn;
  if (wrappers.length > 1) {
    nextFn = utils.wrapFn(fn, wrappers.slice(1));
  }

  var wrappedFn = function () {

    var fnArguments = arguments;

    var next = nextWithAutoArgs.bind(this, nextFn, fnArguments);

    return wrappers[0].bind(this, next).apply(this, arguments);
  };

  return wrappedFn;
};

utils.hookable = function (obj) {

  if (obj.hook) {
    return;
  }

  var hooks = {};

  obj.method = function (name, fn, replace) {

    var hook;

    if (name in hooks) {

      if (!replace) {
        throw new Error('Hook already defined: ' + name);
      }

      hook = hooks[name];
    } else {
      hook = {};
      hooks[name] = hook;
      hook.wrappers = [];
    }

    hook.fn = fn;
    hook.compiled = null;

    obj[name] = function () {
      if (hook.compiled === null) {
        hook.compiled = utils.wrapFn(fn, hook.wrappers);
      }
      return hook.compiled.apply(this, arguments);
    };
  };

  obj.replaceMethod = function (name, fn) {
    return obj.method(name, fn, true);
  };

  obj.hasMethod = function (name) {
    return name in hooks;
  };

  obj.wrap = function (name, wrapFn) {

    if (!(name in hooks)) {

      throw new Error('Hook not defined: ' + name);
    }

    var hook = hooks[name];

    hook.wrappers.push(wrapFn);
    hook.compiled = null;
  };

};

// utils.arrayContains = function (array, target, equals) {
//   return _.any(array, function (value) {
//     return equals ? equals(target, value) : (target === value);
//   });
// };
//
// utils.arrayDiff = function (a1, a2, equals) {
//   return _.filter(a1, function (value) {
//     return !utils.arrayContains(a2, value, equals);
//   });
// };

var textPart = function (value, type) {
  type = type || 'text';
  return {
    type: type,
    value: value
  };
};

utils.parseTextWithTags = function (value) {
  value = value || '';
  var parts = value.split('{{');
  var frontPart = [];
  if (parts[0] !== '') {
    frontPart = [
      textPart(parts[0])
    ];
  }
  parts = frontPart.concat(
    parts.slice(1).map(function (part) {
      if (part.indexOf('}}') >= 0) {
        return [
          textPart(part.substring(0, part.indexOf('}}')), 'tag'),
          textPart(part.substring(part.indexOf('}}') + 2))
        ];
      } else {
        return textPart('{{' + part, 'text');
      }
    })
  );
  return [].concat.apply([], parts);
};

var SAFE_CONTROL_CODES = [
  0x80,
  0x81,
  0x82,
  0x83,
  0x84,

  0x86,
  0x87,
  0x88,
  0x89,
  0x8a,
  0x8b,
  0x8c,
  0x8d,
  0x8e,
  0x8f,
  0x90,
  0x91,
  0x92,
  0x93,
  0x94,
  0x95,
  0x96,
  0x97,
  0x98,
  0x99,
  0x9a,
  0x9b,
  0x9c,
  0x9d,
  0x9e,
  0x9f
];

var CONTROL_CODE_INDEX = {};

SAFE_CONTROL_CODES.forEach(function (code, i) {
  CONTROL_CODE_INDEX[code] = i;
});

var toUtfBytes = function (str) {
  var utf8 = unescape(encodeURIComponent(str));

  var arr = [];
  for (var i = 0; i < utf8.length; i++) {
      arr.push(utf8.charCodeAt(i));
  }
  return arr;
};

var fromUtfBytes = function (uintArray) {
    var encodedString = String.fromCharCode.apply(null, uintArray),
        decodedString = decodeURIComponent(escape(encodedString));
    return decodedString;
};

utils.hexToUnicode = function (message) {
  message = message.toUpperCase();
  return message.split('').map(function (char) {
    var code = char.charCodeAt(0);
    if (code >= '0'.charCodeAt(0) && code <= '9'.charCodeAt(0)) {
      code = code - '0'.charCodeAt(0);
      return String.fromCharCode(SAFE_CONTROL_CODES[code]);
    } else if (code >= 'A'.charCodeAt(0) && code <= 'F'.charCodeAt(0)) {
      code = code - 'A'.charCodeAt(0);
      return String.fromCharCode(SAFE_CONTROL_CODES[code + 10]);
    }
  }).join('');
};

utils.unicodeToHex = function (message) {
  return message.split('').map(function (char) {
    var code = char.charCodeAt(0);
    code = CONTROL_CODE_INDEX[code];
    if (code < 10) {
      return String.fromCharCode(code + '0'.charCodeAt(0));
    } else {
      return String.fromCharCode(code - 10 + 'A'.charCodeAt(0));
    }
  }).join('');
};

utils.stringToHex = function (string) {
  return toUtfBytes(string).map(function (code) {
    return code.toString(16);
  }).join('');
};

utils.hexToString = function (hex) {
  var bytes = hex.match(/.{1,2}/g).map(function (hex) {
    return parseInt(hex, 16);
  });
  return fromUtfBytes(bytes);
};

utils.hideUnicodeMessage = function (message) {
  return utils.hexToUnicode(utils.stringToHex(message));
};

utils.unhideUnicodeMessage = function (message) {
  return utils.hexToString(utils.unicodeToHex(message));
};

// utils.charDiff = function (a, b, step) {
//   var start = 0;
//   var end = a.length;
//   if (step > 0 || typeof step === 'undefined') {
//     step = 1;
//   } else {
//     step = -1;
//     start = a.length - 1;
//     end = -1;
//   }
//   var i;
//   for (i = start; i !== end; i = i + step) {
//     if (a[i] !== b[i]) {
//       if (step > 0) {
//         return i;
//       }
//       return i + 1;
//     }
//   }
//   return null;
// };

// utils.diff = function (a, b) {
//   // Simple cases first.
//   if (a === b) {
//     return null;
//   }
//   if (b.substring(0, a.length) === a) {
//     return {
//       insert: b.substring(a.length),
//       delete: '',
//       pos: a.length
//     };
//   }
//   if (b.substring(b.length - a.length) === a) {
//     return {
//       insert: b.substring(0, b.length - a.length),
//       delete: '',
//       pos: 0
//     };
//   }
//   if (a.substring(0, b.length) === b) {
//     return {
//       delete: a.substring(b.length),
//       insert: '',
//       pos: b.length
//     };
//   }
//   if (a.substring(a.length - b.length) === b) {
//     return {
//       delete: a.substring(0, a.length - b.length),
//       insert: '',
//       pos: 0
//     };
//   }
// };

module.exports = utils;
