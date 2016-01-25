;(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory.call(root);
  } else {
    root.path = factory.call(root);
  }
}(this, function () {
  'use strict';
  var root = this || window;
  var doc = root.document;
  var loc = root.location;

  // prototype method shortcut
  var slice = [].slice;

  // regExp
  var reBase = /([^/?#]*)$/;
  var reDir = /(?:([^?#]*)\/)*/;
  var reExt = /(?:[^./]+)(\.[^/.]+)$/;
  var rePro = /(?:^[\w]+?\:\/{2,})/;
  //var reSep = /\//;


  /**
   * Path.js API
   * @return {Object}
   * @see https://github.com/jinder/path/blob/master/path.js
   */
  return (function() {
    return {
      parse     : parse,
      basename  : basename,
      dirname   : dirname,
      extname   : extname,
      join      : join,
      cwd       : cwd,
      resolve   : resolve,
      relative  : relative,
      normalize : normalize,
      equal     : equal,
      pass      : pass,
      misbutton : misbutton
    };
  })();


  /**
   * parse
   * @param {String} pathString
   * @return {Object}
   */
  function parse(pathString) {
    var a = doc.createElement('a');
    a.href = pathString;

    var protocol = a.protocol;
    var domain = a.hostname;
    var port = a.port;
    var path = a.pathname;
    var search = a.search;
    var hash = a.hash;
    var host = a.host;
    var origin = a.origin;
    var dir = reDir.test(path) ? reDir.exec(path)[1] : '';
    var base = reBase.test(path) ? reBase.exec(path)[1] : '';
    var ext = reExt.test(path) ? reExt.exec(path)[1] : '';

    return {
      protocol  : protocol,
      domain    : domain,
      port      : port,
      host      : host,
      origin    : origin,
      path      : path,
      search    : search,
      hash      : hash,
      dir       : dir,
      base      : base,
      ext       : ext
    };
  }


  /**
   * format
   * @param {Object} pathObject
   * @return {String}
   */
  function format(pathObject) {
    if (!isObject(pathObject)) {
      throw new TypeError('Parameter `pathObject` must be an object, not ' +
        typeof pathObject);
    }

    var root = pathObject.root || '';

    if (!isString(root)) {
      throw new TypeError('`pathObject.root` must be a string or undefined, not '  + 
        typeof pathObject.root);
    }

    var dir = pathObject.dir ? pathObject.dir + '/' : '';
    var base = pathObject.base || '';
    return dir + base;
  }


  /**
   * get the file name from [pathname]
   * @param {String} p <pathname>
   * @param {String} ext <.extname>
   * @return {String} <file name>
   */
  function basename(p, ext) {
    var f = parse(p).base;
    if (ext && f.substr(-1 * ext.length) === ext) {
      f = f.substr(0, f.length - ext.length);
    }
    return f;
  }


  /**
   * get the directory name from [pathname]
   * return value is [absolute path]
   * @param {String} p <pathname>
   * @return {String} <directory name>
   */
  function dirname(p) {
    return parse(p).dir;
  }


  /**
   * get the extension name from [pathname]
   * @param {String} p <pathname>
   * @return {String} extname <.ext> (contains dot)
   */
  function extname(p) {
    return parse(p).ext;
  }


  /**
   * join the pathes
   * @param {String} [path1, path2, path3...]
   * @return {String} joined path
   */
  function join() {
    var path = '';
    var args = slice.call(arguments, 0);
    if (arguments.length <= 1) args.unshift(cwd());

    for (var i = 0; i < args.length; i += 1) {
      var segment = args[i];
      if (!isString(segment)) {
        throw new TypeError ('Arguemnts to path.join must be strings');
      }
      if (segment) {
        if (!path) {
          path += segment;
        } else {
          path += '/' + segment;
        }
      }
    }

    return normalize(path);
  }


  /**
   * resolve
   * @param {String} [from ...]
   * @param {String} to
   */
  function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var hasDomain = false;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i -= 1) {
      var p = (i >= 0) ? arguments[i] : !hasDomain ? cwd() : '';

      if (!hasDomain) {
        hasDomain = isDomain(p);
      }

      if (!isString(p)) {
        throw new TypeError('Arguments to path.resolve must be strings');
      } else if (!p) {
        continue;
      }

      resolvedPath = p + '/' + resolvedPath;
      resolvedAbsolute = p[0] === '/';
    }

    resolvedPath = normalizeArray(resolvedPath.split('/'), !resolvedAbsolute).join('/');
    return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
  }


  /**
   * make the relative path
   * @param {String} from
   * @param {String} to
   *
   */
  function relative(from, to) {
    from = resolve(from).substr(1);
    to = resolve(to).substr(1);

    var fromParts = trimArray(from.split('/'));
    var toParts = trimArray(to.split('/'));

    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;

    for (var i = 0; i < length; i += 1) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }

    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i += 1) {
      outputParts.push('..');
    }

    outputParts = outputParts.concat(toParts.slice(samePartsLength));

    return outputParts.join('/');
  }


  /**
   * Is it equal to [enviroment path] and [assingment path]
   * - If the [arguments path] is relative path, and then
   *   converted to an absolute path.
   * @param {String} env
   * @param {String} asg (contains wildcards[**|*])
   */
  function equal(env, asg) {

    if (arguments.length === 1) {
      env = cwd();
      asg = arguments[0];
    }

    if (!isAbsolute(asg)) {
      asg = join(cwd(), asg);
    }

    if (!isAbsolute(env)) {
      env = join(cwd(), env);
    }

    var envParts = trimArray(env.split('/'));
    var asgParts = trimArray(asg.split('/'));
    var length = Math.max(envParts.length, asgParts.length);
    var diff = envParts.length - asgParts.length;
    var match = true;

    for (var i = 0; i < length; i += 1) {
      if ('**' === asgParts[i]) {
        if (diff--) asgParts.splice(i, 0, '**');
        continue;
      }
      if ('*' === asgParts[i]) continue;
      if (/^(\*\.)/.test(asgParts[i]) &&
        (extname(envParts[i]) === extname(asgParts[i]))) {
        continue;
      }
      if (envParts[i] !== asgParts[i]) {
        match = false;
      }
    }

    return match;
  }


  /**
   * pass
   * @param {String} passport
   * @param {Function} callback
   * @param {Function} errback
   */
  function pass(passport, callback, errback) {
    if (equal(passport)) {
      return callback && callback();
    }
    return errback && errback();
  }


  /**
   * misbutton
   * @param {String} [current]
   * @return {String} missing
   */
  function misbutton(current, missing) {
    if (arguments.length < 2) {
      current = cwd();
      missing = arguments[0];
    }

    var root = isAbsolute(current) ? '/' : '';
    var curParts = trimArray(current.split('/'));
    var misParts = trimArray(missing.split('/'));
    var length = curParts.length;
    var sameIndex = 0;

    for (var i = 0; i < length; i += 1) {
      if (curParts[i] === misParts[sameIndex]) {
        sameIndex += 1;
      }
    }
    var diffLength = length - sameIndex;
    var head = curParts.slice(0,diffLength);
    var res = head.concat(misParts);

    return root + res.join('/');
  }


  /**
   * normalize pathname
   * @param {String} p <pathname>
   * @return {String}
   */
  function normalize(p) {
    var isAbsolutePath = isAbsolute(p);
    var trailingSlash = p && p[p.length - 1] === '/';

    p = normalizeArray(p.split('/'), !isAbsolutePath).join('/');

    if (!p && !isAbsolutePath) {
      p += '.';
    }
    if (p && trailingSlash) {
      p += '/';
    }
    return (isAbsolutePath ? '/' : '') + p;
  }


  /**
   * normalize array
   * @param {Array} parts
   * @param {Boolean} allow above root
   * @return {Array}
   */
  function normalizeArray(parts, allowAboveRoot) {
    var res = [];

    for (var i = 0; i < parts.length; i += 1) {
      var p = parts[i];
      if (!p || p === '.') continue;
      if (p === '..') {
        if (res.length && res[res.length - 1] !== '..') {
          res.pop();
        } else if (allowAboveRoot) {
          res.push('..');
        }
      } else if (/^http(s)?:/.test(p)) {
        res.push(p + '/');
      } else {
        res.push(p);
      }
    }
    return res;
  }


  /**
   * is absolute path ?
   * @param {String} p <pathname>
   * @return {Boolean}
   */
  function isAbsolute(p) {
    return p.charAt(0) === '/';
  }


  /**
   * is relative path ?
   * @param {String} p <pathname>
   * @return {Boolean}
   */
  function isRelative(p) {
    return !isAbsolute(p);
  }


  /**
   * is domain ?
   * @param {String} p <pathname>
   * @return {Boolean}
   */
  function isDomain(p) {
    return rePro.test(p);
  }


  /**
   * get the current working directory
   * - return value is absolute path
   * @return {String}
   */
  function cwd() {
    return dirname(parse(loc.href).path);
  }


  /**
   * Array trim
   * @param {Array} arr
   * @return {Array}
   */
  function trimArray(arr) {
    return arr.filter(function(a) {
      return a !== '';
    });
  }


  /**
   * is [x] object ?
   * @param {Any} x
   * @return {Boolean}
   */
  function isObject(x) {
    return typeof x === 'object';
  }


  /**
   * is [x] string ?
   * @param {Any} x
   * @return {Boolean}
   */
  function isString(x) {
    return typeof x === 'string';
  }

}));
