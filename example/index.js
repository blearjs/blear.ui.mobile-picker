/**
 * 文件描述
 * @author ydr.me
 * @create 2016-06-27 17:34
 */


'use strict';


var MobilePicker = require('../src/index');
var Linkage = require('blear.classes.linkage');

var mobilePicker = new MobilePicker({
    length: 3
});
var linkage = new Linkage({
    length: 3
});

linkage.on('getData', function (index, parent, done) {
    var i = 0;
    var j = Math.round(Math.random() * 10) + 2;
    var list = [];

    for (; i < j; i++) {
        list.push({
            text: (parent ? '父' + parent : '') + '子' + i,
            value: i
        });
    }

    done(list);
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

document.getElementById('open').onclick = function () {
    mobilePicker.open();
};
