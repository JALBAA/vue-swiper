module.exports = {
    methods:{
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
        loopList: function(){
            var length = this.options.perSliders
            for(var i=0; i < length; i++){
                this.list.push(this.originList[i])
            }
            for(var i=this.originList.length-1; i>=this.originList.length-length; i--){
                this.list.unshift(this.originList[i])
            }
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
            //for security
            this.idx = idx;

            this.animating = true;

            //compute translateX
            var initPos = this.translateX
            var targetPos = -this.wrapperWidth/this.options.perSliders*Math.floor(this.options.perSliders)*idx;
            var deltaX = Math.floor((targetPos - initPos))

            if(!this.options.loop && this.idx == this.pageCount-1 && this.pageCount>1){
                this.translateX = -this.listWidth+this.wrapperWidth
            }else
               this.translateX += deltaX;

            if(Math.abs(this.translateX - targetPos) > 6)
                requestAnimationFrame(renderFrame)
            else
                this.translateX = targetPos

            this.$dispatch('scrollTo',idx);
        }
    },
    events: {
        scrollTo: function(idx){
            if(idx != this.idx)
                this.scrollTo(idx)
        }
    },
}
