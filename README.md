# path.js

`path.js` on browser.  
inspired by [path.js](https://github.com/jinder/path/blob/master/path.js)


## Install

```sh
$ npm install path-browser
```

## Usage

```html
<script src="path.min.js"></script>
```

```js
var joined = path.join('http://example.com', 'bar/foo', '../css/style.css');
// return 'http://example.com/bar/css/style.css'
```

## Methods

|method|summary|
|:--|:--|
|`parse`|文字列のURLを受け取ってパースしたオブジェクトを返す|
|`basename`|ファイル名を返す|
|`dirname`|ディレクトリーを返す|
|`extname`|拡張子を返す|
|`isAbsolute`|絶対パスかどうか|
|`join`|複数のパスをつなげる|
|`cwd`|現在のディレクトリーを返す|
|`resolve`|複数のパスの相対関係を解決した絶対パスを返す|
|`relative`|2つの絶対パスを受け取って、2つ目のパスを相対パスで返す|


__`parse(pathString)`__  

```js
path.parse('http://example.com:8080/foo/bar/index.html?value=key#hash');
//  return {
//    protocol: 'http:',
//    domain: 'example.com',
//    port: '8080',
//    host: 'example.com:8080',
//    origin: 'http://example.com:8080',
//    path: '/foo/bar/index.html'
//    search: '?key=value',
//    hash: '#hash',
//    dir: '/dir/bar',
//    base: 'index',
//    ext: '.html'
//  }
```


__`basename(path [, ext])`__

```js
path.basename('/foo/bar/index.min.html');
// return index.min.html
path.basename('/foo/bar/index.min.html', '.html');
// return index.min
```


__`dirname(path)`__

```js
path.dirname('/foo/bar/index.html');
// return /foo/bar
```

__`extname(path)`__

```js
path.extname('/foo/bar/index.html');
// return .html
```


__`join(url1, url2 [, url3...])`__

```js
path.join('/foo', 'bar', 'baz/asdf', 'quux', '..');
// return /foo/bar/baz/asdf
path.join('http://example.com', 'bar/foo', '../css/style.css');
// 'http://example.com/bar/css/style.css'
```


__`resolve([from... ,] to)`__

```js
path.resolve('/foo/bar', './baz');
// return /foo/bar/baz
path.resolve('/foo/bar', '../css/style.css');
// return /dir1/css/style.css
```


__`relative(from, to)`__

```js
path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb');
// return ../../impl/bbb
```


__`equal([host, ] target)`__


```js
path.equal('/foo/bar/*.html');
// return true
path.equal('/foo/bar/index.html', '/foo/**/*.html');
// return true
```

if argument value is relative path, and then converted to absolute path. And then calculated from `cwd`.

```js
path.equal('./index.html');
// calculated "/current/working/directory/index.html"
```


__`cwd()`__

`return value` is absolute path.

```js
path.cwd();
// return [current working directory]
```

## License

MIT
