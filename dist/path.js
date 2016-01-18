// version 0.0.-1

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
  var a = document.createElement('a');

  // regExp
  var reURL = /^(?:([A-za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/
  var reFilename = /([^/]*)\.([^/]*)$/;
  var reExtname = /\.([^/.]+)$/;
  var reProtocol = /(^http(s)?\:\/\/)/;
  var reSeparator = /\//;
  var reDirname = /(?:([^.]*)\/)*/;


  /**
   * Path.js API
   * @return {Object}
   * @see https://github.com/jinder/path/blob/master/path.js
   * @see https://nodejs.org/api/path.html#path_path_relative_from_to
   */

  return (function() {
    return {
      parse     : parse,
      basename  : basename,
      dirname   : dirname,
      extname   : extname,
      isAbsolute: isAbsolute,
      join      : join,
      cwd       : cwd,
      resolve   : resolve,
      relative  : relative
    };
  })();


  /**
   * parse
   * @param {String} pathString
   * @return {Object}
   */
  function parse(pathString) {
    a.href = pathString;
    var parsed = splitPath(a.href);
    var protocol = parsed[1] + ':';
    var domain = parsed[3];
    var port = parsed[4];
    var path = '/' + parsed[5];
    var search = '?' + parsed[6];
    var hash = '#' + parsed[7];
    var base = path.match(reFilename);
    var ext = path.match(reExtname);
    var dir = path.match(reDirname);

    return {
      protocol  : protocol,
      domain    : domain,
      port      : port,
      host      : domain + ':' + port,
      origin    : protocol + '//' + domain + ':' + port,
      path      : path,
      search    : search,
      hash      : hash,
      dir       : dir && dir[1],
      base      : base && base[1],
      ext       : ext && ('.' + ext[1])
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
   * get the file name by [pathname]
   * @param {String} p <pathname>
   * @param {String} ext <.extname>
   */
  function basename(p, ext) {
    var matched = p.match(reFilename);
    if (!matched) return '';
    if (ext && ext.replace(/^\./,'') === matched[2]) {
      return matched[1];
    }
    return matched[0];
  }


  /**
   * get the directory name by [pathname]
   * @param {String} p <pathname>
   */
  function dirname(p) {
    var parsed = parse(p).path;
    var filename = basename(parsed);
    var re = new RegExp('/' + filename + '$');
    return parsed.replace(re, '');
  }


  /**
   * get the extension name by [pathname]
   * @param {String} p <pathname >
   * @return {String} extname <.ext> (added dot)
   */
  function extname(p) {
    var parsed = parse(p).path;
    var filename = basename(parsed);
    if (!filename || filename.charAt(0) === '.') return '';
    var matched = filename.match(reExtname);
    if (!matched) return '';
    return matched[0];
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
   * is domain ?
   * @param {String} p <pathname>
   * @return {Boolean}
   */
  function isDomain(p) {
    return reProtocol.test(p);
  }


  /**
   * join the pathes
   * @param {String} [url1, url2, url3...]
   * @return {String}
   */
  function join() {
    var args = Array.prototype.slice.call(arguments, 0);
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
    for (var i = 0; i < length; i++) {
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
   * get the current working directory
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
   * split path
   * @param {String} url
   * @return {Array}
   */
  function splitPath(url) {
    return reURL.exec(url);
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
