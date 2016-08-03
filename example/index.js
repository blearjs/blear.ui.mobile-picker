/**
 * 文件描述
 * @author ydr.me
 * @create 2016-06-27 17:34
 */


'use strict';
var mobilePicker = require('../src/index');


var picker = new mobilePicker({
    title: '请选择居住地',
    length: 3
});

picker.render(0, [{text:'浙江省', value: 1},{text:'湖北省', value: 1},{text:'安徽省', value: 1},{text:'浙江省', value: 1},{text:'湖北省', value: 1},{text:'安徽省', value: 1},{text:'浙江省', value: 1},{text:'湖北省', value: 1},{text:'安徽省', value: 1}], "浙江省");

picker.on('changeList', function(i) {
    console.log(i)
    var index = i + 1;
    picker.render(index, [{text:'杭州', value: 1},{text:'宁波', value: 1},{text:'温州', value: 1},{text:'绍兴', value: 1},{text:'金华', value: 1},{text:'台州', value: 1}], "杭州");
});

document.getElementById('picker').onclick = function() {
    picker.open(this);
};



