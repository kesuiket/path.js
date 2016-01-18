# path.js

`path.js` on browser.  
inspired by [path.js](https://github.com/jinder/path/blob/master/path.js)


```sh
$ npm install path-browser
```

```js
var joined = path.join('http://example.com', 'bar/foo', '../css/style.css');
// return 'http://example.com/bar/css/style.css'
```


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


## License

MIT
