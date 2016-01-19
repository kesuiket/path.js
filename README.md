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
|`equal`|2つのパスを比較し、同等かどうかを判定します。ドメインは考慮しません|
|`misbutton`|2つのパスを受け取り、1つ目のパスを基にて2つ目のパスのズレを解決します|


### parse(pathString)

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


### basename(path [, ext])

```js
path.basename('/foo/bar/index.min.html');
// return index.min.html
path.basename('/foo/bar/index.min.html', '.html');
// return index.min
```


### dirname(path)

```js
path.dirname('/foo/bar/index.html');
// return /foo/bar
```

### extname(path)

```js
path.extname('/foo/bar/index.html');
// return .html
```


### join(url1, url2 [, url3...])

```js
path.join('/foo', 'bar', 'baz/asdf', 'quux', '..');
// return /foo/bar/baz/asdf
path.join('http://example.com', 'bar/foo', '../css/style.css');
// 'http://example.com/bar/css/style.css'
```


### resolve([from... ,] to)

```js
path.resolve('/foo/bar', './baz');
// return /foo/bar/baz
path.resolve('/foo/bar', '../css/style.css');
// return /dir1/css/style.css
```


### relative(from, to)

```js
path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb');
// return ../../impl/bbb
```


### equal([host, ] target)


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


## pass(path [, callback, errback])

```js
path.path('/**/*', function() {
  console.log('callback');
}, function() {
  console.log('errback...');
})
```


### misbutton([current, ] missing)

```js
path.misbutton('/foo/css/style.css');
// set implicitly the current directory
// example) cwd: "/stg/foo/"
// return "/stg/foo/css/style.css"
```

### cwd()

`return value` is absolute path.

```js
path.cwd();
// return [current working directory]
```

## License

MIT
