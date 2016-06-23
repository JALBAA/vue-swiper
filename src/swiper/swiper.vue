<script>
    import utils from '../utils.js'
    import base from './swiper.base.vue'
    module.exports = {
        mixins: [base],
        props: ['list','options','cubic'],
        data: function(){
            return {
                //原始列表
                originList: [],
                //当前的索引
                idx:0,
                //经过duplicate后列表的长度
                length:0,
                //translateX的值
                translateX:0,
                frameCnt: 0,
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
        },
        created: function(){
            this.baseInit()
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
        },
        compiled: function(){
            //是否自动播放
            if(!!this.options.autoPlay)
                this.autoPlay();

            //检测当前的索引值
            this.$watch('idx',utils.proxy(function(idx){
                this.$dispatch('idxChange',idx)
                this.$broadcast('idxChange',idx)
            },this))

            this.baseCompiled()
        },
        ready: function(){
            this.baseReady();
        },
        events: {
            scrollTo: function(idx){
                if(idx != this.idx)
                    this.scrollTo(idx)
            },
            touchStart: function(e){
                if(this.idx == this.length){
                    this.idx = 0;
                    this.scrollTo(this.idx);
                }else if(this.idx == -1){
                    this.idx = this.length-1;
                    this.scrollTo(this.idx);
                }
            },
            touchEnd: function(e){
                if(!this.isCanScroll)return;
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
            },
            transitionEnd: function(){
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
        },
        methods: {
            loopList: function(){
                var length = this.options.perSliders
                for(var i=0; i < length; i++){
                    this.list.push(this.originList[i])
                }
                for(var i=this.originList.length-1; i>=this.originList.length-length; i--){
                    this.list.unshift(this.originList[i])
                }
            },
            autoPlay: function(time){
                var _this = this;
                this.frameCnt = 0;
                function renderFrame() {
                    if(_this.easing){
                        _this.frameCnt++
                        if(_this.frameCnt == 60 * 5){
                            _this.frameCnt = 0;
                            _this.next();
                        }
                    }
                    requestAnimationFrame(renderFrame)
                }
                requestAnimationFrame(renderFrame)
            },
            computeTransLimit: function(){
                var children = this.$el.querySelector('.swiper').children
                this.maxTranslateX = 0
                for(var i=0; i<children.length; i++){
                    this.maxTranslateX += children[i].offsetWidth
                }
                this.maxTranslateX -= this.wrapperWidth
            },
            prev: function(){
                if(!!this.options.loop)
                    this.idx = (this.idx == -1) ? this.length-1 : this.idx-1;
                else
                    this.idx = (this.idx == 0) ? this.idx : this.idx-1;
                this.scrollTo(this.idx);
            },
            next: function(){
                if(!!this.options.loop)
                   this.idx = (this.idx == this.length) ? 0 : this.idx+1;
                else
                   this.idx = (this.idx == this.pageCount-1) ? this.idx : this.idx+1;
                this.scrollTo(this.idx);
            },
            scrollTo: function(idx){
                var self = this
                this.animating = true;
                this.idx = idx;
                var initPos = this.translateX
                var targetPos = -this.wrapperWidth/this.options.perSliders*Math.floor(this.options.perSliders)*idx;
                var deltaX = Math.floor((targetPos - initPos))
                if(!self.options.loop && self.idx == self.pageCount-1 && self.pageCount>1){
                    self.translateX = -self.listWidth+self.wrapperWidth
                }else
                   self.translateX += deltaX;
                if(Math.abs(self.translateX - targetPos) > 6)
                    requestAnimationFrame(renderFrame)
                else
                    self.translateX = targetPos
                this.$dispatch('scrollTo',idx);
            }
        }
    }
</script>
