// version 0.0.-1

;(function(root) {
  var doc = root.document;
  
  // regExp
  var reFilename = /([^/]*)\.([^/])*$/;
  var reSeparator = /\//;


  /**
   * Path
   * @class
   */
  var Path = function() {

    return {
      init: init,
      relative: relativePath,
      isAbsolute: isAbsolute
    }
  };


  /**
   * init
   * @param {String} url
   * @return {Object}
   */
  function init(url) {
    var _a = doc.createElement('a');
    _a.href = url;
    
    return {
      hash: _a.hash,
      host: _a.host,
      hostname: _a.hostname,
      pathname: _a.pathname,
      port: _a.port,
      protocol: _a.protocol,
      origin: _a.origin,
      serach: _a.serach
    }
  }


  /**
   * absolute path convert relative path
   * @param {String} from <relative path>
   * @param {String} to <absolute path>
   * @return {String} (to) <relative path>
   */
  function relativePath(from, to) {
    var score = calcAbsluteScore(to);
    var rel = trimArray(excludeFilename(from.split(reSeparator)));
    var abs = trimArray(excludeDotpath(to.split(reSeparator)));
    var res = rel.slice(0, score).concat(abs);
    return '/' + res.join('/');
  }


  /**
   * is absolute path ?
   * @param {String} pathname
   */
  function isAbsolute(pathname) {
    return pathname.charAt(0) === '/';
  }

  /**
   * Calculate the score from the absolute path
   * - `../` = -1
   * - `./` = 0
   * @param {String} pathname
   * @return {Number}
   */
  function calcAbsluteScore(pathname) {
    var score = 0;
    var dirs = pathname.split(reSeparator);
  
    dirs.forEach(function(dir) {
      if (dir === '') return 0;
      switch (dir) {
        case '..': score += (-1); break;
        case '.': score += 0; break;
        default: return 0;
      }
    });
    
    return score;
  }

  /**
   * Exclude absolute path from [directory array]
   * @param {Array} arr
   * @return {Array}
   */
  function excludeDotpath(arr) {
    return arr.filter(function(a) {
      return a !== '..' && a !== '.';
    });
  }


  /**
   * Exclude pathname from [directory array]
   * @param {Array} arr
   * @return {Array}
   */
  function excludeFilename(arr) {
    return arr.filter(function(a) {
      return !reFilename.test(a);
    });
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

})(this);
