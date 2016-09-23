/**
 * 手机端选择器，联动效果需要配合 blear.classes.linkage 实现
 * @author ydr.me
 * @create 2016-08-13 11:59
 */



'use strict';

var array = require('blear.utils.array');
var object = require('blear.utils.object');
var typeis = require('blear.utils.typeis');
var selector = require('blear.core.selector');
var event = require('blear.core.event');
var layout = require('blear.core.layout');
var attribute = require('blear.core.attribute');
var Popup = require('blear.ui.popup');
var Touchable = require('blear.classes.touchable');
var Template = require('blear.classes.template');
var time = require('blear.utils.time');

var template = require('./template.html');
var selectTemplate = require('./select.html');
var optionTemplate = require('./option.html');

var tpl = new Template(template);
var selectTpl = new Template(selectTemplate);
var optionTpl = new Template(optionTemplate);
var namespace = 'blearui-mobilePicker';
var CONTAINER_HEIGHT = 220;
var OPTION_HEIGHT = 36;
var MAX_TRANSLATE_Y = (CONTAINER_HEIGHT - OPTION_HEIGHT) / 2;
var defaults = {
    /**
     *  title名称
     */
    title: '请选择',
    /**
     * 联级长度， 默认1
     */
    length: 1
};

var MobilePicker = Popup.extend({
    className: 'MobilePicker',
    constructor: function (options) {
        var the = this;

        MobilePicker.parent(the);
        the[_options] = object.assign({}, defaults, options);
        the.setHTML(tpl.render({
            options: the[_options]
        }));
        the[_initData]();
        the[_initNode]();
        the[_initEvent]();
    },


    /**
     * 渲染数据
     * @param index
     * @param list
     * @returns {MobilePicker}
     */
    render: function (index, list) {
        var the = this;

        the[_optionsList][index] = list;
        the[_minTranslateYList][index] = -(list.length - 1) * OPTION_HEIGHT + MAX_TRANSLATE_Y;
        the[_optionsEls][index].innerHTML = optionTpl.render({
            list: list
        });

        if (!the[_isSetValue] && list.length) {
            time.nextTick(function () {
                the[_translateList][index] = MAX_TRANSLATE_Y;
                the[_setTranslateY](index, MAX_TRANSLATE_Y);
                the[_selectedIndexList][index] = 0;
                the.emit('change', index, the[_value][index] = list[0].value, list[0].text);
            });
        }

        if (!the[_ready] && index === the[_options].length - 1) {
            the[_ready] = true;
            the.emit('ready');
            array.each(the[_readyCallbacks], function (_, callback) {
                callback.call(the);
            });
        }

        return the;
    },


    /**
     * 获取当前选中的值
     * @returns {Array}
     */
    getValue: function () {
        var the = this;
        var value = [];

        array.each(the[_optionsList], function (index, list) {
            value[index] = list[the[_selectedIndexList][index] || 0].value;
        });

        return value;
    },


    /**
     * 设置值
     * @param value
     * @returns {MobilePicker}
     */
    setValue: function (value) {
        var the = this;
        the[_isSetValue] = true;
        the.emit('setValue', the[_setValue] = value);
        return the;
    },


    /**
     * 改变某一项值
     * @param index
     * @param value
     * @returns {MobilePicker}
     */
    changeValue: function (index, value) {
        var the = this;
        var selectedIndex = 0;

        if (!value) {
            return the;
        }

        array.each(the[_optionsList][index], function (index, item) {
            if (item.value + '' === value + '') {
                selectedIndex = index;
                return false;
            }
        });
        var selectedOption = the[_optionsList][index][selectedIndex];
        the.emit('change', index, selectedOption.value, selectedOption.text);

        var translateY = -selectedIndex * OPTION_HEIGHT + MAX_TRANSLATE_Y;
        the[_translateList][index] = translateY;
        the[_setTranslateY](index, translateY);
        the[_selectedIndexList][index] = selectedIndex;

        if (index === the[_options].length - 1) {
            time.nextTick(function () {
                the[_isSetValue] = false;
            });
        }

        return the;
    }
});
var _options = MobilePicker.sole();
var _initNode = MobilePicker.sole();
var _initEvent = MobilePicker.sole();
var _initData = MobilePicker.sole();
var _optionsList = MobilePicker.sole();
var _touchableList = MobilePicker.sole();
var _minTranslateYList = MobilePicker.sole();
var _translateList = MobilePicker.sole();
var _optionsEls = MobilePicker.sole();
var _ready = MobilePicker.sole();
var _readyCallbacks = MobilePicker.sole();
var _setTranslateY = MobilePicker.sole();
var _selectedIndexList = MobilePicker.sole();
var _value = MobilePicker.sole();
var _isSetValue = MobilePicker.sole();
var _setValue = MobilePicker.sole();
var pro = MobilePicker.prototype;

pro[_initData] = function () {
    var the = this;

    the[_translateList] = [];
    array.each(new Array(the[_options].length), function (index) {
        the[_translateList][index] = MAX_TRANSLATE_Y;
    });
    the[_optionsList] = [];
    the[_minTranslateYList] = [];
    the[_readyCallbacks] = [];
    the[_selectedIndexList] = [];
    the[_value] = [];
    the[_ready] = false;
    the[_isSetValue] = false;
};

pro[_initNode] = function () {
    var the = this;
    var selectsEl = selector.query('.' + namespace + '-selects', the.getContainerEl())[0];
    var list = new Array(the[_options].length);

    selectsEl.innerHTML = selectTpl.render({
        list: list
    });

    the[_optionsEls] = selector.query('.' + namespace + '-options', selectsEl);
};

pro[_initEvent] = function () {
    var the = this;
    var containerEl = the.getContainerEl();
    var selectEls = selector.query('.' + namespace + '-select', containerEl);
    var sureEl = selector.query('.' + namespace + '-header-sure', containerEl)[0];

    the[_touchableList] = [];
    array.each(selectEls, function (index, selectEl) {
        the[_touchableList][index] = new Touchable({
            el: selectEl
        });

        the[_touchableList][index].on('touchStart', function (meta) {
        });

        the[_touchableList][index].on('touchMove', function (meta) {
            var translateY = meta.deltaY + the[_translateList][index];

            translateY = Math.min(MAX_TRANSLATE_Y, translateY);
            translateY = Math.max(the[_minTranslateYList][index], translateY);
            the[_setTranslateY](index, translateY);
        });

        the[_touchableList][index].on('touchEnd', function (meta) {
            var selectedIndex = Math.round((MAX_TRANSLATE_Y - the[_translateList][index] - meta.deltaY) / OPTION_HEIGHT);
            selectedIndex = Math.max(selectedIndex, 0);
            selectedIndex = Math.min(selectedIndex, the[_optionsList][index].length - 1);
            var translateY = the[_translateList][index] = -selectedIndex * OPTION_HEIGHT + MAX_TRANSLATE_Y;
            the[_setTranslateY](index, translateY);
            var selectedOption = the[_optionsList][index][selectedIndex];
            the.emit('change', index, the[_value][index] = selectedOption.value, selectedOption.text);
            the[_selectedIndexList][index] = selectedIndex;
        });
    });

    event.on(sureEl, 'click', function () {
        the.emit('sure', the[_value]);
        the.close();
    });
};

pro[_setTranslateY] = function (index, translateY) {
    attribute.style(this[_optionsEls][index], 'transform', {
        translateY: translateY
    });
};

require('./style.css', 'css|style');
MobilePicker.defaults = defaults;
module.exports = MobilePicker;

