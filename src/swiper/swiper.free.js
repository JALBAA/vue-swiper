module.exports = {
    methods: {
        computeTransLimit: function(){
            var children = this.$el.querySelector('.swiper').children
            this.maxTranslateX = 0
            for(var i=0; i<children.length; i++){
                this.maxTranslateX += children[i].offsetWidth
            }
            this.maxTranslateX -= this.wrapperWidth
        }
    },
    events: {
        ready: function(){
            this.computeTransLimit()
        }
    }
}
