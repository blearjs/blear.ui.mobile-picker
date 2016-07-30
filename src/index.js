/**
 * blear.ui.mobile-picker
 * @author ydr.me
 * @create 2016年06月04日14:09:36
 */

'use strict';

var address = require('./address');
var array = require('blear.utils.array');
var object = require('blear.utils.object');
var selector = require('blear.core.selector');
var layout = require('blear.core.layout');
var attribute = require('blear.core.attribute');
var UI = require('blear.ui');

var count = 90, //常量
    itemHeight= 36, //li高度
    selectedClassName = 'blearui-mobilePicker-items-selected',
    maxNum = 90;





var defaults = {
    /**
     * 标题
     * @type string
     */
    title: ''
};
var CLASSNAME = 'blearui-mobilePicker';


// @todo 继承 UI 类
var Picker =  function(option, arr) {
    var self = this;
    self.touchCurrentEl = '';
    var opt = object.assign({}, defaults, option);

    // @todo 用遮罩实现
    document.body.addEventListener('touchstart', function(e) {
        var el = e.target;
        var isMatch = selector.closest(el, self.node);
        var isPicker = el.tagName == 'INPUT' && el.className == 'picker';

        if(!self.touchCurrentEl && isPicker){
            self.touchCurrentEl = el;
        }
        var isSame = el == self.touchCurrentEl;
        if(isMatch.length == 0 && !isSame) {
            self.close();
        }

        if(isPicker) {
            if(el.value) {
                self.setValueArr = el.value.split(' ');
            }
        }

    }, false);

    return self.init(opt);
};

Picker.prototype = {
    init: function(opt) {
        var self = this;

        self.cityIndex= 0;
        self.provinceId = 2;  //默认省份北京

        self.provinceArr = [];
        self.cityArr = [];
        self.touchElArr = [];
        self.provinceEl= '';
        self.cityEl = '';

        self.distanceY = 0;  //记录上一次滑动结束的值
        self.provinceY = count;
        self.cityY = count;
        self.currentCityArr = [];
        self.provinceStr = '';
        self.cityStr = '';
        self.setValueArr = [];

        self.isScrolling = 0;
        self.startPos = {};
        self.endPos = {};
        self.lineOffsetTop = 0;


        self.dataSegment(opt);
        var sureEl = selector.query('.blearui-mobilePicker-header-sure', self.node)[0];
        sureEl.onclick = function() {
            self.close();
        };

    },
    /**
     *  创建dom
     * @param opt {object}
     */
    createHtml: function(opt) {
        var self = this;
        var div = document.createElement('div');

        div.className = CLASSNAME;
        var html =
            '<div class="blearui-mobilePicker-header">' +
            '<div class="blearui-mobilePicker-header-title">'+ opt.title +'</div>' +
            '<div class="blearui-mobilePicker-header-sure">确定</div>' +
            '</div>' +
            '<div class="blearui-mobilePicker-items">' +
            '<div class="blearui-mobilePicker-items-col blearui-mobilePicker-province"></div>' +
            '<div class="blearui-mobilePicker-items-col blearui-mobilePicker-city"></div>' +
            '<div class="blearui-mobilePicker-items-line"></div>' +
            '</div>';
        div.innerHTML = html;
        document.body.appendChild(div);
        self.node = div;
        self.render();
    },
    /**
     * open 打开
     */
    open: function() {
        var self = this;
        self.node.style.marginLeft = '0';
        var pickerEl = selector.query(self.node)[0];
        attribute.removeClass(pickerEl, 'bounceOutDown');
        attribute.addClass(pickerEl, 'animated');
        attribute.addClass(pickerEl, 'bounceInUp');

        if(self.setValueArr.length == 0) {
            setTimeout(function() {
                self.getAddressStr(self.provinceArr[0][1], self.currentCityArr[0][1]);
            }, 600);
        }else {
            var provinceElement = selector.query('.blearui-mobilePicker-province', self.node)[0];
            var cityElement = selector.query('.blearui-mobilePicker-city', self.node)[0];

            array.each(self.provinceArr, function(i, el) {
                if(el[1] == self.setValueArr[0]) {
                    self.provinceId = el[0];
                    self.eachProvince(provinceElement, i);
                    self.update(cityElement, self.provinceId);

                    self.provinceY = count - i * itemHeight;
                }
            });

            array.each(self.currentCityArr, function(i, el) {
                if(el[1] == self.setValueArr[1]) {
                    self.cityIndex = i;
                    self.update(cityElement, self.provinceId);
                    var subEl = selector.query(cityElement)[0];
                    attribute.addClass(selector.query('.blearui-mobilePicker-items-sub', subEl)[i], selectedClassName);

                    self.cityY = count - i * itemHeight;
                }
            });

        }
    },
    /**
     * close 打开
     */
    close: function() {
        this.touchCurrentEl = '';
        var pickerEl = selector.query(this.node)[0];
        attribute.removeClass(pickerEl, 'bounceInUp');
        attribute.addClass(pickerEl, 'bounceOutDown');
    },
    /**
     * render 渲染数据
     */
    render: function() {
        var self = this;
        self.provinceEl = selector.query('.blearui-mobilePicker-province', self.node)[0];
        self.cityEl = selector.query('.blearui-mobilePicker-city', self.node)[0];

        self.touchElArr.push(self.provinceEl,self.cityEl);
        self.eachProvince(self.provinceEl);
        self.eachCity(self.cityEl, self.provinceId);

    },
    /**
     *  数据分割
     */
    dataSegment: function(opt) {
        var self = this;
        self.provinceArr= [];
        self.cityArr = [];
        array.each(address.address, function(i, el) {
            if(el[2] == 1) {
                self.provinceArr.push(el);
            }else if(el[2] != 0) {
                self.cityArr.push(el);
            }
        });

        self.createHtml(opt);

        //给需要滑动的元素，添加touchstart事件
        array.each(self.touchElArr, function(i, el) {
            el.addEventListener('touchstart', self, false);
        });
    },
    /**
     * 加载省份列表
     * @param el 省份容器
     */
    eachProvince: function(el, index) {
        var self = this;
        var index = index || 0;
        var num = (count - index * itemHeight);
        var subDiv = document.createElement('div');
        subDiv.className = CLASSNAME + '-items-wrapper';
        subDiv.style.transform = 'translate3d(0px, '+ num +'px, 0px)';
        subDiv.style.transitionDuration = '0ms';

        array.each(self.provinceArr, function(i, el) {
            if(i == index){
                subDiv.innerHTML += '<div class="blearui-mobilePicker-items-sub '+ selectedClassName +'" data-id="'+el[0]+'">'+ el[1] +'</div>'
            }else {
                subDiv.innerHTML += '<div class="blearui-mobilePicker-items-sub" data-id="'+el[0]+'">'+ el[1] +'</div>'
            }
        });
        el.innerHTML = '';
        el.appendChild(subDiv);
    },
    /**
     * 加载市列表
     * @param el 显示市的容器
     * @param id 省份id
     */
    eachCity: function(el, id) {
        var self = this;
        var subDiv = document.createElement('div');
        self.currentCityArr = [];
        subDiv.className = CLASSNAME + '-items-wrapper';
        subDiv.style.transform = 'translate3d(0px, '+ (count-self.cityIndex * itemHeight) +'px, 0px)';
        subDiv.style.transitionDuration = '0ms';

        // 筛选所有城市列表里的当前城市
        array.each(self.cityArr, function(i, el) {
            if(el[2] == id) {
                self.currentCityArr.push(el);
            }
        });

        //循环当前城市
        array.each(self.currentCityArr, function(i, el) {
            if(i == self.cityIndex) {
                subDiv.innerHTML += '<div class="blearui-mobilePicker-items-sub '+ selectedClassName +'">'+ el[1] +'</div>';
            }else {
                subDiv.innerHTML += '<div class="blearui-mobilePicker-items-sub">'+ el[1] +'</div>';
            }
        });

        el.innerHTML = '';
        el.appendChild(subDiv);

    },
    /**
     * 数据更新, 重新渲染dom
     * @param el 显示市的容器
     * @param id 省份id
     */
    update: function(el, id) {
        var self = this;
        self.eachCity(el, id);
    },
    /**
     * 手指滑动事件
     */

    // @todo 使用 blear.classes.touchable 实现
    handleEvent : function(event) {
        var self = this;
        if(event.type == 'touchstart'){
            self.start(event, self);
        }else if(event.type == 'touchmove'){
            self.move(event, self);
        }else if(event.type == 'touchend'){
            self.end(event, self);
        }

    },
    /**
     * touchstart
     * @param event 当前touch的event对象
     */
    start: function(event, self) {
        var touch = event.targetTouches[0];
        self.lineOffsetTop = layout.offsetTop(selector.query('.blearui-mobilePicker-items-line', self.node)[0]);

        self.startPos = {
            x:touch.pageX,
            y:touch.pageY,
            time:+new Date
        };
        self.isScrolling = 0;   //判断是垂直滚动还是水平滚动

        array.each(self.touchElArr, function(i, el) {
            el.addEventListener('touchmove', self, false);
            el.addEventListener('touchend', self, false);
        });
    },
    /**
     * touchmove
     * @param event 当前touch的event对象
     */
    move: function(event) {
        var self = this;
        //当屏幕有多个touch或者页面被缩放过，就不执行move操作
        if(event.targetTouches.length > 1 || event.scale && event.scale !== 1) return;

        var touch = event.targetTouches[0];
        self.endPos = {
            x:touch.pageX - self.startPos.x,
            y:touch.pageY - self.startPos.y
        };
        self.isScrolling = Math.abs(self.endPos.x) < Math.abs(self.endPos.y) ? 1:0;    //isScrolling为1时，表示纵向滑动，0为横向滑动

        if(self.isScrolling === 1){

            var targetEl = event.target;
            event.preventDefault();//阻止滚屏

            self.calculate(self.endPos.y, targetEl);

        }
    },
    /**
     * touchend
     * @param event 当前touch的event对象
     */
    end: function(event) {
        var self = this;

        var duration = +new Date - self.startPos.time;  //滑动的持续时间
        if(self.isScrolling === 1){    //当纵向滚动时
            if(Number(duration) > 10){

                var itemEl = self.getTargetEl(event.target);
                var type = itemEl.parentNode.className.slice(38);
                if(type == 'province') {
                    self.provinceY += self.endPos.y;
                }else {
                    self.cityY += self.endPos.y;
                }

                //判断是否拉出上下范围内
                var eTarget = event.target;
                if(self.provinceY > maxNum) {
                    self.provinceY = count;
                    self.calculate(0, eTarget);
                }else if(self.cityY > maxNum) {
                    self.cityY = count;
                    self.calculate(0, eTarget);
                }else if(self.provinceY < count - (self.provinceArr.length-1) * itemHeight) {
                    self.provinceY = count - (self.provinceArr.length-1) * itemHeight;
                    self.calculate(0, eTarget);
                }else if( self.cityY < count - (self.currentCityArr.length-1) * itemHeight ) {
                    self.cityY = count - (self.currentCityArr.length-1) * itemHeight;
                    self.calculate(0, eTarget);
                }

                self.computeSite(itemEl);
            }
        }
        array.each(self.touchElArr, function(i, el) {
            el.removeEventListener('touchmove', self, false);
            el.removeEventListener('touchend', self, false);
        });
    },
    /**
     * 滑动动画
     * @param distance 移动距离
     * @param el 滑动的当前容器
     * @param actualValue 实际移动距离
     */
    calculate: function(distance, el, actualValue) {
        var self = this;
        if(el.parentNode.className == 'blearui-mobilePicker-items-wrapper' || el.childNodes[0].className == 'blearui-mobilePicker-items-wrapper' || el.className == 'blearui-mobilePicker-items-wrapper') {
            var itemEl;
            if(el.className == 'blearui-mobilePicker-items-wrapper'){
                itemEl = el;
            }else {
                itemEl = self.getTargetEl(el);
            }

            var type = itemEl.parentNode.className.slice('blearui-mobilePicker-items-'.length);

            if(type == 'province') {
                self.distanceY = self.provinceY;
            }else {
                self.distanceY = self.cityY;
            }

            var actualValues = actualValue ? (actualValue-self.distanceY) : 0;
            itemEl.style.transform = 'translate3d(0px, '+ (self.distanceY+distance+actualValues) +'px, 0px)';
            itemEl.style.transitionDuration = '300ms';
        }

    },
    /**
     * 返回匹配新节点
     * @param el
     */
    getTargetEl: function(el) {
        var itemEl;
        if(el.parentNode.className == 'blearui-mobilePicker-items-wrapper'){
            itemEl = el.parentNode;
        }else if(el.childNodes[0].className == 'blearui-mobilePicker-items-wrapper') {
            itemEl = el.childNodes[0];
        }
        return itemEl;
    },
    /**
     * 计算位置并添加class标记
     * @param el
     */
    computeSite: function(el) {
        var self = this;
        var isProvinceEl = !!el.parentNode.className.match(/province/g);
        setTimeout(function() {
            var subTop = layout.offsetTop(el);
            var differ = Math.round(+(self.lineOffsetTop - subTop) / itemHeight);
            var childNodesEl = selector.query('.blearui-mobilePicker-items-sub', el);

            array.each(childNodesEl, function(i, el) {
                if( i == differ) {
                    var cityElement = selector.query('.blearui-mobilePicker-city', self.node)[0];
                    var id = attribute.data(childNodesEl[i], 'id');
                    attribute.addClass(childNodesEl[i], selectedClassName);


                    self.cityStr = childNodesEl[i].innerHTML;
                    if(isProvinceEl){
                        self.cityY = count;
                        self.cityIndex = 0;
                        self.update(cityElement, id);
                        self.provinceStr = childNodesEl[i].innerHTML;
                        self.cityStr = self.currentCityArr[0][1];
                    }else {
                        self.cityStr = childNodesEl[i].innerHTML;
                        if(!self.provinceStr) {
                            self.provinceStr = self.setValueArr[0];
                        }
                    }
                }else {
                    attribute.removeClass(childNodesEl[i], selectedClassName);
                }
            });

            var round = count - differ * itemHeight;
            self.calculate(0, el, round);
            self.getAddressStr(self.provinceStr, self.cityStr);
        }, 301);
    },
    /**
     * 返回地址
     * @param pStr
     * @param cStr
     */
    getAddressStr: function(pStr, cStr) {
        var self = this;
        attribute.attr(self.touchCurrentEl, 'value', pStr+' '+cStr);
    }

};

require('../src/style.css', 'css|style');
module.exports = Picker;

