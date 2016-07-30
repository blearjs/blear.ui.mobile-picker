/**
 * 文件描述
 * @author ydr.me
 * @create 2016-06-27 17:34
 */


'use strict';
var Picker = require('../src/index');

var picker = new Picker({
    title: '请选择居住地'
});

document.getElementById('picker').onclick = function() {
    picker.open();
};

var picker2 = new Picker({
    title: '请选择收货地址'
});
document.getElementById('picker2').onclick = function() {
    picker2.open();
};




