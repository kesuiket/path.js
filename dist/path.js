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

  var root = window;
  var doc = root.document;
  var loc = root.location;

  // regExp
  var reURL = /^(?:([A-za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/
  var reFilename = /([^/]*)\.([^/]*)$/;
  var reExtname = /\.([^/.]+)$/;
  var reSeparator = /\//;
  var reDirname = /(?:([^.]*)\/)*/;


  /**
   * Path
   * @class
   */
  var Path = (function() {

    return {
      parse: parse,
      basename: basename,
      dirname: dirname,
      extname: extname,
      isAbsolute: isAbsolute,
      join: join,
      cwd: cwd,
      resolve: resolve,
      relative: relative
    };
  })();

  return Path;


  /**
   * parse
   * @param {String} pathString
   * @return {Object}
   */
  function parse(pathString) {
    var URL = doc.createElement('a');
    URL.href = pathString;

    var pathname = URL.pathname;
    var base = pathname.match(reFilename);
    var ext = pathname.match(reExtname);
    var dir = pathname.match(reDirname);

    return {
      hash      : URL.hash,
      host      : URL.host,
      domain    : URL.hostname,
      path      : URL.pathname,
      port      : URL.port,
      protocol  : URL.protocol,
      origin    : URL.origin,
      serach    : URL.search,
      dir       : dir  && dir[1],
      base      : base && base[1],
      ext       : ext  && ('.' + ext[1])
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
   * @param {String} pathname
   * @param {String} ext <.extname>
   */
  function basename(pathname, ext) {
    var matched = pathname.match(reFilename);
    if (!matched) return '';
    if (ext && ext.replace(/^\./,'') === matched[2]) {
      return matched[1];
    }
    return matched[0];
  }


  /**
   * get the directory name by [pathname]
   * @param {String} pathname
   */
  function dirname(pathname) {
    var parsed = parse(pathname).path;
    var filename = basename(parsed);
    var re = new RegExp('/' + filename + '$');
    return parsed.replace(re, '');
  }


  /**
   * get the extension name by [pathname]
   * @param {String} pathname
   * @return {String} extname <.ext> (added dot)
   */
  function extname(pathname) {
    var parsed = parse(pathname).path;
    var filename = basename(parsed);
    if (!filename || filename.charAt(0) === '.') return '';
    var matched = filename.match(reExtname);
    if (!matched) return '';
    return matched[0];
  }


  /**
   * is absolute path ?
   * @param {String} pathname
   */
  function isAbsolute(pathname) {
    return pathname.charAt(0) === '/';
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
   * @param {String} pathname
   * @return {String}
   */
  function normalize(pathname) {
    var _isAbsolute = isAbsolute(pathname);
    var _trailingSlash = pathname && pathname[pathname.length - 1] === '/';
    pathname = normalizeArray(pathname.split('/'), !_isAbsolute).join('/');
    if (!pathname && !_isAbsolute) {
      pathname += '.';
    }
    if (pathname && _trailingSlash) {
      path += '/';
    };
    return (_isAbsolute ? '/' : '') + pathname;
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

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i -= 1) {
      var pathname = (i >= 0) ? arguments[i] : cwd();

      if (!isString(pathname)) {
        throw new TypeError('Arguments to path.resolve must be strings');
      } else if (!pathname) {
        continue;
      }
      resolvedPath = pathname + '/' + resolvedPath;
      resolvedAbsolute = pathname[0] === '/';
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
   * absolute path convert relative path
   * @param {String} from <relative path>
   * @param {String} to <absolute path>
   * @return {String} (to) <relative path>
   */
  //function relativePath(from, to) {
    //var score = calcAbsluteScore(to);
    //var rel = trimArray(excludeFilename(from.split(reSeparator)));
    //var abs = trimArray(excludeDotpath(to.split(reSeparator)));
    //var res = rel.slice(0, score).concat(abs);
    //return '/' + res.join('/');
  //}


  /**
   * Calculate the score from the absolute path
   * - `../` = -1
   * - `./` = 0
   * @param {String} pathname
   * @return {Number}
   */
  //function calcAbsluteScore(pathname) {
    //var score = 0;
    //var dirs = pathname.split(reSeparator);

    //dirs.forEach(function(dir) {
      //if (dir === '') return 0;
      //switch (dir) {
        //case '..': score += (-1); break;
        //case '.': score += 0; break;
        //default: return 0;
      //}
    //});

    //return score;
  //}


  /**
   * Exclude absolute path from [directory array]
   * @param {Array} arr
   * @return {Array}
   */
  //function excludeDotpath(arr) {
    //return arr.filter(function(a) {
      //return a !== '..' && a !== '.';
    //});
  //}


  /**
   * Exclude pathname from [directory array]
   * @param {Array} arr
   * @return {Array}
   */
  //function excludeFilename(arr) {
    //return arr.filter(function(a) {
      //return !reFilename.test(a);
    //});
  //}


  /**
   * get the current working directory
   * @return {String}
   */
  function cwd() {
    var pathname = parse(loc.href).path;
    return dirname(pathname);
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