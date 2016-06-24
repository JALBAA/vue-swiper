<script>
    import utils from '../utils.js'
    import base from './swiper.base.vue'
    export default ({
        mixins: [base],
        props: ['list','options'],
        data: function(){
            return {
                frameCnt: 0,
                lastDeltaList: [],
                listWidth: 0,
                scrolling: false,
            }
        },
        computed: {
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
                        'transition': 'transform .5s ',
                        '-webkit-transition': '-webkit-transform .5s',
                        '-moz-transition': '-moz-transform .5s'
                    }
                }else{
                    return {
                        'transition': 'transform 0s',
                        '-webkit-transition': '-webkit-transform 0s',
                        '-moz-transition': '-moz-transform 0s'
                    }
                }
            },
        },
        created: function(){
            this.baseInit()
        },
        compiled: function(){
            this.baseCompiled();
        },
        ready: function(){
            this.baseReady();
        },
        methods: {
            computeTransLimit: function(){
                var children = this.$el.querySelector('.swiper').children
                this.listWidth = 0
                for(var i=0; i<children.length; i++){
                    this.listWidth += children[i].offsetWidth
                }
                this.listWidth -= this.wrapperWidth
            },
        },
        events: {
            touchStart: function(e){
                this.computeTransLimit()
            },
            touchMove: function(e){
                //累计缓动数据
                if(this.lastDeltaList.length==5)
                    this.lastDeltaList.shift()
                this.lastDeltaList.push(this.deltaX)
            },
            touchEnd: function(e){
                var sum = 0
                this.lastDeltaList.forEach(function(delta){
                    sum += delta
                })
                //计算最后5帧平均值
                var average = sum / this.lastDeltaList.length
                //惯性滑动
                if(average && Math.abs(average)>5)
                    this.translateX += average * 20
                if(this.translateX > 0)
                    this.translateX = 0
                if(this.translateX < -1*this.listWidth)
                    this.translateX = -1*this.listWidth
                this.lastDeltaList = []
            },
            transitionEnd: function(){
            }
        }
    })
</script>
