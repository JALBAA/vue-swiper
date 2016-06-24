<template>
    <div class='swiper-container'
        @touchstart='touchStart'
        @touchmove='touchMove'
        @touchEnd='touchEnd'
        @transitionEnd='transitionEnd'
        >
        <div class='swiper'
            v-bind:style= '[transform,transition]'>
                <slot name='slider'>
                </slot>
        </div>
        <slot name="pagination"></slot>
    </div>
</template>
<script>
import utils from '../utils.js'
export default ({
    data: function(){
        return {
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
            //translateX的值
            translateX:0,
            //窗口的宽
            firstFrame: true,

            isCanScroll: false,

            disableScreenScroll: false,
            wrapperWidth: 0,
            scrollEvent: (function(){
                var event = document.createEvent('HTMLEvents');
                event.initEvent('scroll')
                event.eventType = 'message'
                return event;
            })(),
        }
    },
    methods: {
        baseInit: function(){
            this.disableScreenScrollOnManipulating();
            //init options
            var defaultOptions = {
                loop: false,
                direction: 'horizontal',
                perSliders: 1,
                perGroup: 1,
                autoPlay: false,
                pagination: true,
                'height': 'auto'
            }
            this.options = this.options || defaultOptions
            //mixin
            for(var key in defaultOptions){
                if(!this.options[key]){
                    this.options[key] = defaultOptions[key]
                }
            }
        },
        baseCompiled: function(){
            var _this = this
            var _renderFrame = function(){
                window.dispatchEvent(_this.scrollEvent)
                if(this.animating)
                    window.requestAnimationFrame(_renderFrame)
            }
            this.$watch('animating',function(animating){
                if(!!this.animating)
                    window.requestAnimationFrame(_renderFrame)
            })
            this.$el.addEventListener('webkitTransitionEnd',utils.proxy(function(){
                this.transitionEnd();
            },this))
            this.$el.addEventListener('mozTransitionEnd',utils.proxy(function(){
                this.transitionEnd();
            },this))
        },
        baseReady: function(){
            this.wrapperWidth = this.options.wrapperWidth || this.$el.offsetWidth;
            this.$broadcast('resize',this.wrapperWidth,this.pageCount,this.options.height)
            window.addEventListener('resize',utils.proxy(function(){
                this.$broadcast('resize',this.wrapperWidth,this.pageCount,this.options.height)
            },this))
        },
        disableScreenScrollOnManipulating: function(){
            window.addEventListener('scroll',utils.proxy(function(e){
                if(this.disableScreenScroll)
                    e.preventDefault();
            },this))
            document.addEventListener('touchmove',function(e){
                if(this.disableScreenScroll)
                    e.preventDefault();
            })
        },
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
            this.$emit('touchStart',e)
        },
        touchEnd: function(e){
            this.disableScreenScroll = false;
            this.easing = true;

            this.$emit('touchEnd',e)
        },
        touchMove: function(e){
            if(this.list.length<=1)return;
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
                    this.isCanScroll = true;
                    this.disableScreenScroll = true;
                }else{
                    this.isCanScroll = false;
                    this.disableScreenScroll = false;
                }
            }
            //scroll if possible
            if(this.isCanScroll){
                if(this.translateX>0){
                    this.translateX += this.deltaX/2;
                }else if(this.translateX < -(this.listWidth - this.wrapperWidth) ){
                    this.translateX += this.deltaX/2;
                }else{
                    this.translateX += this.deltaX;
                }
                this.endPosX = this.curPosX;
            }
            this.$emit('touchMove',e)
            //now it's not the firstFrame
            this.firstFrame = false;
        },
        transitionEnd: function(e){
            this.$emit('transitionEnd',e)
            //TODO optimize in future
            var event = document.createEvent('HTMLEvents');
            event.initEvent('scrollEnd')
            event.eventType = 'message'
            window.dispatchEvent(event)
        }
    },
})
</script>
<style lang="less">
    .swiper-container {
        overflow: hidden;
        position: relative;
        width: 100%;
        height: 100%;
        .swiper {
            display: flex;
            position: relative;
            .slider {
                flex-shrink: 0;
                position: relative;
            }
        }
    }
</style>
