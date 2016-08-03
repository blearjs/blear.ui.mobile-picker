/**
 * blear.ui.nobile-picker
 * @author ydr.me
 * @create 2016年06月04日14:09:36
 */

'use strict';
var array = require('blear.utils.array');
var object = require('blear.utils.object');
var selector = require('blear.core.selector');
var layout = require('blear.core.layout');
var attribute = require('blear.core.attribute');
var UI = require('blear.ui');
var ViewModel = require('blear.classes.view-model');
var Touchable = require('blear.classes.touchable');
var time = require('blear.utils.time');

var template = require('./template.html');
var CLASSNAME = 'blearui-mobilePicker';
var SELECTED_CLASS = CLASSNAME + '-items-selected';
var ITEM_HEIGHT = 36;

var defaults = {
    /**
     *  title名称
     */
    title: '1111',
    /**
     * 联级长度， 默认1
     */
    length: 1
};

var mobilePicker = UI.extend({
    className: 'mobilePicker',
    constructor: function(options) {
        var self = this;
        mobilePicker.parent(self);
        self[_options] = object.assign({}, defaults, options);
        self[_options].length = new Array(self[_options].length);
        self[_initData]();
        self[_initNode]();
        self[_touchable]();
        self.open();
    },
    render: function(index, list, value) {
        var self = this;
        var data = self[_data];
        data.linkage[index] = list;

        self[_deltaYArr][index].deltaY = 0;

        // time.nextTick(function() {
        //     self.emit('changeList', i);
        // });

        var wrapperEl = selector.query('.'+ CLASSNAME +'-items-wrapper')[index];
        attribute.style(wrapperEl, 'transform', 'translate3d(0px, 90px, 0px)');
        var html = '';
        array.each(data.linkage[index], function(i, el) {
            html += '<div class="blearui-mobilePicker-items-sub">'+ el.text +'</div>'
        });
        wrapperEl.innerHTML = html;

    },
    open: function(el) {
        var self = this;
        var currentPicker = selector.query(self[_node])[0];
        self[_node].style.marginLeft = 0;
        attribute.removeClass(currentPicker, 'bounceOutDown');
        attribute.addClass(currentPicker, 'animated');
        attribute.addClass(currentPicker, 'bounceInUp');
        self[_inputEl] = el;
    },
    close: function() {
        var self = this;
        var currentPicker = selector.query(self[_node])[0];
        attribute.removeClass(currentPicker, 'bounceInUp');
        attribute.addClass(currentPicker, 'bounceOutDown');
    }
});

var pro = mobilePicker.prototype;
var _options = mobilePicker.sole();
var _initData = mobilePicker.sole();
var _initNode = mobilePicker.sole();
var _data = mobilePicker.sole();
var _vm = mobilePicker.sole();
var _node = mobilePicker.sole();
var _touchable = mobilePicker.sole();
var _deltaYArr = mobilePicker.sole();
var _setStyle = mobilePicker.sole();
var _inputEl = mobilePicker.sole();
var _calculate = mobilePicker.sole();

/**
 * 初始化数据
 */
pro[_initData] = function() {
    var self = this;
    self[_data] = self[_options];
    self[_data].linkage = [];
};

/**
 *  初始化dom节点
 */
pro[_initNode] = function() {
    var self = this;
    var div = document.createElement('div');
    div.className = CLASSNAME;
    document.body.appendChild(div);

    self[_vm] = new ViewModel({
        el: div,
        data: self[_data],
        template: template,
        methods: {
            onSure: function() {
                self.close();
            }
        }
    });

    self[_node] = div;
};

/**
 *  滑动事件
 */
pro[_touchable] = function() {
    var self = this;
    self[_deltaYArr] = [];
    array.each(self[_options].length, function(i) {
        var touchEl = selector.query('.'+ CLASSNAME +'-items-col', self[_node])[i];
        var childEl = selector.children(touchEl)[0];
        var touchAble = new Touchable({
            el: touchEl
        });

        // 分别记录每一级移动位置
        self[_deltaYArr].push({deltaY: 0});

        touchAble.on('touchMove', function(ret) {
            var deltaY = ret.deltaY;
            attribute.style(childEl, 'transform', 'translate3d(0px, '+ (self[_deltaYArr][i].deltaY + deltaY + 90) +'px, 0px)');
            childEl.style.transitionDuration = '0ms';
        });

        touchAble.on('touchEnd', function(ret) {
            var itemsEl = selector.query('.'+ CLASSNAME +'-items-sub', childEl);
            var itemsLen = itemsEl.length - 1;
            //记录上一次移动的距离
            self[_deltaYArr][i].deltaY += ret.deltaY;

            var deltaY = self[_deltaYArr][i].deltaY;
            if(deltaY > 0) {
                self[_deltaYArr][i].deltaY = 0;
                self[_calculate](childEl, 90);
                self[_setStyle](itemsEl, 0);
            }else if(deltaY < -itemsLen * ITEM_HEIGHT) {
                self[_deltaYArr][i].deltaY = -itemsLen * ITEM_HEIGHT;
                self[_calculate](childEl, self[_deltaYArr][i].deltaY + 90);
                self[_setStyle](itemsEl, itemsLen);
            }else {
                var index = Math.round(-(self[_deltaYArr][i].deltaY) / ITEM_HEIGHT);
                self[_calculate](childEl, 90 - ITEM_HEIGHT * index);
                self[_setStyle](itemsEl, index);
            }

            console.log(i);
            if(i < self[_options].length.length - 1) {
                self.emit('changeList', i);
            }
        });

    });
};

/**
 * 设置当前样式
 * @param el {{array}} 需要设置样式的元素数组
 * @param index {{number}} 需要设置元素的当前索引
 */
pro[_setStyle] = function(el, index) {
    array.each(el, function(i, el) {
        if( i == index) {
            attribute.addClass(el, SELECTED_CLASS);
        }else {
            attribute.removeClass(el, SELECTED_CLASS);
        }
    });
};

/**
 * 滑动动画
 * @param childEl 需要设置动画的元素
 * @param distance 需要移动的距离
 */
pro[_calculate] = function(childEl, distance) {
    attribute.style(childEl, 'transform', 'translate3d(0px, '+ distance +'px, 0px)');
    childEl.style.transitionDuration = '300ms';

};

require('./style.css', 'css|style');
mobilePicker.defaults = defaults;
module.exports = mobilePicker;
