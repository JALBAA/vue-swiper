//scroller.vue
<template>
    <div class='swiper-container'
        @touchstart='touchStart'
        @touchmove='touchMove'
        @touchEnd='touchEnd'
        @transitionEnd='transitionEnd'
        >
        <div class='swiper swiper-scroller'
            v-bind:style= '[transform,transition]'>
                <slot name='slider'>
                </slot>
        </div>
        <slot></slot>
    </div>
</template>
<script>
    var free = require('./swiper.free.js')
    var page = require('./swiper.page.js')
    var utils = require('../utils.js')
    module.exports = {
        mixins: [free, page],
        props: ['list','options','cubic'],
        data: function(){
            return {
                //原始列表
                originList: [],
                //touch开始的位置
                startPosX: 0,
                //touch结束的位置
                endPosX: 0,
                //上一帧的位置
                lastPosX: 0,
                //当前帧的位置
                curPosX: 0,
                //每帧的变动
                deltaX: 0,
                //上一帧的位置
                lastPosY: 0,
                //当前帧的位置
                curPosY: 0,
                //每帧的变动
                deltaY: 0,
                //是否正在缓动
                easing: true,
                //是否允许开启动画
                animating: false,
                //当前的索引
                idx:0,
                //经过duplicate后列表的长度
                length:0,
                //translateX的值
                translateX:0,
                //窗口的宽
                firstFrame: true,
                scroll: false,
                disableScreenScroll: false,
                frameCnt: 0,
                mode: 'page',
                lastDeltaList: [],
                maxTranslateX: 0,
                wrapperWidth: 0
            }
        },
        computed: {
            pageCount: function(){
                var pageCount = this.originList.length/parseInt(this.options.perSliders);
                return Math.ceil(pageCount);
            },
            transform: function(){
                return {
                    'transform': 'translate3d('+this.translateX+'px, 0,0)',
                    '-webkit-transform': 'translate3d('+this.translateX+'px,0,0)',
                    '-moz-transform': 'translate3d('+this.translateX+'px,0,0)',
                }
            },
            transition: function(){
                if(this.easing){
                    return {
                        'transition': 'transform .3s ',
                        '-webkit-transition': '-webkit-transform .3s',
                        '-moz-transition': '-moz-transform .3s'
                    }
                }else{
                    return {
                        'transition': 'transform 0s',
                        '-webkit-transition': '-webkit-transform 0s',
                        '-moz-transition': '-moz-transform 0s'
                    }
                }
            },
            listWidth: function(){
                return this.wrapperWidth/this.options.perSliders * this.originList.length || 0;
            },
            scrollEvent: function(){
                var event = document.createEvent('HTMLEvents');
                event.initEvent('scroll')
                event.eventType = 'message'
                return event;
            },
        },
        created: function(){
            if(this.options.perSliders == 0){
                this.mode = 'free'
            }
            //init
            var _this = this;
            window.addEventListener('scroll',function(e){
                if(_this.disableScreenScroll)
                    e.preventDefault();
            })
            document.addEventListener('touchmove',function(e){
                if(_this.disableScreenScroll)
                    e.preventDefault();
            })
            //clone list
            //init options
            var defaultOptions = {
                loop: false,
                direction: 'horizontal',
                perSliders: 1,
                perGroup: 1,
                autoPlay: false,
                pagination: true,
                'height': 'auto'
            };
            this.options = this.options || defaultOptions
            //mixin
            for(var key in defaultOptions){
                if(!this.options[key]){
                    this.options[key] = defaultOptions[key]
                }
            }
            //如果是循环，则首尾重复
            if(!!this.options.loop){
                this.originList = this.list.map(function(item,idx){
                    return item
                });
                var redundant = this.originList.length % this.options.perSliders
                for(var i=0; i<redundant; i++){
                    this.originList.push(new Object())
                    this.list.push(new Object())
                }
                this.loopList()
                this.length = this.pageCount
            }else{
				this.originList = this.list
                this.options.perSliders > 0 ? this.originList.length/this.options.perSliders : 1
			}
            this.$emit('created')
        },
        compiled: function(){
            var _this = this;

            //是否自动播放
            if(!!this.options.autoPlay)
                this.autoPlay();

            //检测当前的索引值
            this.$watch('idx',function(idx){
                _this.$dispatch('idxChange',idx)
                _this.$broadcast('idxChange',idx)
            })
            var _renderFrame = function(){
                window.dispatchEvent(_this.scrollEvent)
                if(_this.animating)
                    window.requestAnimationFrame(_renderFrame)
            }
            this.$watch('animating',function(val){
                if(val)
                    window.requestAnimationFrame(_renderFrame)
            })

            this.$el.addEventListener('webkitTransitionEnd',function(){
                _this.transitionEnd();
            })
            this.$el.addEventListener('mozTransitionEnd',function(){
                _this.transitionEnd();
            })
        },
        ready: function(){
            //初始化swiper长度
            this.wrapperWidth = this.options.wrapperWidth || this.$el.offsetWidth;
            this.$broadcast('resize',this.wrapperWidth,this.pageCount,this.options.height)
            window.addEventListener('resize',utils.proxy(function(){
                this.$broadcast('resize',this.wrapperWidth,this.pageCount,this.options.height)
            },this))
            this.$emit('ready')
        },
        methods: {
            touchStart: function(e){
                //reset status
                if(this.animating){
                    this.transitionEnd()
                }
                this.firstFrame = true;
                this.animating = false;
                this.deltaX = 0;
                this.easing = false

                //set init value
                this.curPosX = e.touches[0].pageX;
                this.lastPosX = this.curPosX;
                this.startPosX = this.curPosX;

                this.curPosY = e.touches[0].pageY;
                this.lastPosY = this.curPosY;

                if(this.mode == 'page'){
                    if(this.idx == this.length){
                        this.idx = 0;
                        this.scrollTo(this.idx);
                    }else if(this.idx == -1){
                        this.idx = this.length-1;
                        this.scrollTo(this.idx);
                    }
                }
            },
            touchMove: function(e){
                if(this.list.length==1)return;

                //not animating yet
                this.animating = false;
                this.easing = false;

                //get deltaX
                this.curPosX = e.touches[0].pageX;
                this.deltaX =  this.curPosX - this.lastPosX;
                this.lastPosX = this.curPosX;

                //get deltaY
                this.curPosY = e.touches[0].pageY;
                this.deltaY =  this.curPosY - this.lastPosY;
                this.lastPosY = this.curPosY;

                //juedge user's manipulation
                //vertical or horizontal
                if(this.firstFrame){
                    if(!this.deltaX || !this.deltaY){
                        e.preventDefault();
                    }
                    //用一个对角线做判断
                    if(Math.abs(this.deltaX)*0.5 > Math.abs(this.deltaY)){
                        e.preventDefault();
                        this.scroll = true;
                        this.disableScreenScroll = true;
                    }else{
                        this.scroll = false;
                        this.disableScreenScroll = false;
                    }
                }
                //scroll if possible
                if(this.scroll){
                    if(this.translateX>0){
                        this.translateX += this.deltaX/2;
                    }else if(this.translateX < -(this.listWidth - this.wrapperWidth) ){
                        this.translateX += this.deltaX/2;
                    }else{
                        this.translateX += this.deltaX;
                    }
                    this.endPosX = this.curPosX;
                }
                //now it's not the firstFrame
                this.firstFrame = false;


                if(this.mode == 'free'){
                    //累计缓动数据
                    if(this.lastDeltaList.length==5)
                        this.lastDeltaList.shift()
                    this.lastDeltaList.push(this.deltaX)

                }
            },
            touchEnd: function(e){
                this.disableScreenScroll = false;
                this.easing = true;
                if(this.mode == 'free'){
                    var sum = 0
                    this.lastDeltaList.forEach(function(delta){
                        sum += delta
                    })
                    //计算最后5帧平均值
                    var average = sum / this.lastDeltaList.length
                    //惯性滑动
                    if(average)
                        this.translateX += average * 5
                    if(this.translateX > 0)
                        this.translateX = 0
                    if(this.translateX < -1*this.maxTranslateX)
                        this.translateX = -1*this.maxTranslateX
                    this.lastDeltaList = []
                }else if(this.mode == 'page'){

                    if(!this.scroll)return;
                    if(this.mode == 'free')return;
                    if(Math.abs(this.deltaX) == 0){
                        this.scrollTo(this.idx)
                        return
                    }
                    //judge the idx to go
                    var deltaX = this.endPosX - this.startPosX;
                    if(deltaX <-.1*this.wrapperWidth){
                        this.next();
                    }
                    else if(deltaX >.1*this.wrapperWidth){
                        this.prev();
                    }
                    else{
                        this.scrollTo(this.idx)
                    }
                }
            },
            transitionEnd: function(){
                if(this.mode == 'free')return
                this.frameCnt = 0
                if(this.idx == this.length){
                    this.easing = false;
                    this.idx = 0;
                    this.scrollTo(this.idx);
                    var _this = this;
                    setTimeout(function(){
                        _this.easing = true;
                        _this.animating = false;
                    },50);
                }else if(this.idx == -1){
                    this.easing = false;
                    this.idx = this.length-1;
                    this.scrollTo(this.idx);
                    var _this = this;
                    setTimeout(function(){
                        _this.easing = true;
                        _this.animating = false;
                    },50);
                }else{
                    this.animating = false;
                }
            }
        }
    }
</script>
<style lang='less'>
    .swiper-container {
        overflow: hidden;
        position: relative;
        width: 100%;
        height: 100%;
        .swiper {
            display: -webkit-box;
            display: -moz-box;
            position: relative;
        }
    }
</style>
