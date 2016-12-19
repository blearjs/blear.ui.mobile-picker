/**
 * 文件描述
 * @author ydr.me
 * @create 2016-06-27 17:34
 */


'use strict';


var MobilePicker = require('../src/index');
var Linkage = require('blear.classes.linkage');

var build1 = function () {
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

    document.getElementById('open1').onclick = function () {
        mobilePicker.open();
    };
};

var build2 = function () {
    var mobilePicker = new MobilePicker({
        length: 3
    });
    var linkage = new Linkage({
        length: 3,
        keepable: true
    });
    var renderedMap = {};

    linkage.on('getData', function (index, parent, done) {
        var i = 1;
        var j;
        var list = [];

        switch (index) {
            // 年
            case 0:
                var startYear = 1998;
                var year;
                j = 20;
                for (; i < j; i++) {
                    year = startYear + i;
                    list.push({
                        text: year + '年',
                        value: year
                    });
                }
                break;

            // 月
            case 1:
                // var isLeapYear = (parent % 4 === 0 && (parent % 100 !== 0 || parent % 400 === 0));
                j = 13;
                for (; i < j; i++) {
                    list.push({
                        text: i + '月',
                        value: i
                    });
                }
                break;

            // 日
            case 2:
                j = 32;
                for (; i < j; i++) {
                    list.push({
                        text: i + '日',
                        value: i
                    });
                }
                break;
        }

        done(list);
    });

    linkage.on('changeList', function (index, list) {
        // if (!list.length || renderedMap[index]) {
        //     return;
        // }
        renderedMap[index] = true;
        mobilePicker.render(index, list);
    });

    linkage.on('changeValue', function (index, value) {
        // if (!value) {
        //     return;
        // }
        //
        mobilePicker.changeValue(index, value);
    });

    linkage.ready(function () {
        mobilePicker.on('change', function (index, value) {
            linkage.change(index, value);
            console.log(linkage.getValue());
        });

        mobilePicker.on('setValue', function (value) {
            linkage.setValue(value);
        });
    });

    var open2El = document.getElementById('open2');
    open2El.onclick = function () {
        mobilePicker.open();
    };
};


// =========================================
build1();
build2();
