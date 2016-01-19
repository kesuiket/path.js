/**
 * version 0.0.-1
 * @see https://github.com/jinder/path/blob/master/path.js
 * @see https://nodejs.org/api/path.html#path_path_relative_from_to
 */

var Name = 'path';
;(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root[Name] = factory();
  }
}(this, function () {
  'use strict';

  var root = window || this;
  var doc = root.document;
  var loc = root.location;

  // prototype method shortcut
  var slice = [].slice;

  // regExp
  //          | protocol             | host        | port       | path     | search      | hash
  var reURL = /^([\w]+:)?(?:(?:\/{2,})([\w\d.\-]+))?(?::([\d]+))?(\/[^?#]*)?(\?(?:[^#]*))?(#(?:.*))?$/;

  var reBase = /([^/?#]*)$/;
  var reDir = /(?:([^?#]*)\/)*/;
  var reExt = /(?:[^./]+)(\.[^/.]+)$/;
  var rePro = /(?:^[\w]+?\:\/{2,})/;
  var reSep = /\//;


  /**
   * Path.js API
   * @return {Object}
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
      equal     : equal
    };
  })();


  /**
   * parse
   * @param {String} pathString
   * @return {Object}
   */
  function parse(pathString) {
    var a = document.createElement('a');
    a.href = pathString;
    var allParts = splitPath(a.href);
    var protocol = allParts[0];
    var domain = allParts[1];
    var port = allParts[2];
    var path = allParts[3];
    var search = allParts[4];
    var hash = allParts[5];
    var host = domain + (port ? ':' + port :'');
    var origin = protocol + '//' + host;
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
      throw new TypeError('Parameter `pathObject` must be an object, not ' + typeof pathObject);
    }

    var root = pathObject.root || '';

    if (!isString(root)) {
      throw new TypeError('`pathObject.root` must be a string or undefined, not ' + typeof pathObject.root);
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
   * @param {String} p <pathname>
   * @return {String} <directory name>
   */
  function dirname(p) {
    var parsed = parse(p).path;
    var filename = basename(parsed);
    var re = new RegExp('/' + filename + '$');
    return parsed.replace(re, '');
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
    var args = slice.call(arguments, 0);
    var path = '';

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
    };

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
   * Split a url into
   * [0:protocol, 1:host, 2:port, 3:path, 4:dir, 5:base, 6:ext, 7:search, 8:hash]
   * @param {String} url
   * @return {Array}
   */
  function splitPath(url) {
    return reURL.exec(url).slice(1);
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
