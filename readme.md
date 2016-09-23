# blear.ui.mobile-picker

[![npm module][npm-img]][npm-url]
[![build status][travis-img]][travis-url]
[![coverage][coveralls-img]][coveralls-url]

[travis-img]: https://img.shields.io/travis/blearjs/blear.ui.mobile-picker/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/blearjs/blear.ui.mobile-picker

[npm-img]: https://img.shields.io/npm/v/blear.ui.mobile-picker.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/blear.ui.mobile-picker

[coveralls-img]: https://img.shields.io/coveralls/blearjs/blear.ui.mobile-picker/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/blearjs/blear.ui.mobile-picker?branch=master



## 联动实例
配合`blear.classes.linkage`来实现数据联动。
```
var mobilePicker = new MobilePicker({
    title: '所在地区',
    length: 2
});
var linkage = new Linkage({
    length: 2
});
var urls = [
    '/api/district/provinces',
    '/api/district/cities'
];

linkage.on('getData', function (index, parent, done) {
    api({
        url: urls[index],
        query: {
            parent: parent
        }
    }, function (err, list) {
        if (err) {
            list = [];
        }

        done(list);
    });
});

linkage.on('changeList', function (index, list) {
    mobilePicker.render(index, list);
});

linkage.on('changeValue', function (index, value) {
    mobilePicker.changeValue(index, value);
});

linkage.ready(function () {
    mobilePicker.on('change', function (index, value) {
        linkage.change(index, value);
    });

    mobilePicker.on('setValue', function (value) {
        linkage.setValue(value);
    });
});
```