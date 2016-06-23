//slider.vue
<template>
    <div class='slider' v-bind:style='[otherStyle]'>
        <slot></slot>
    </div>
</template>
<script>
    module.exports = {
        props:['index','content','options','height'],
        data: function(){
            return {
                pos: 0,
                otherStyle: {
                    'width': '1px',
                    'left': '0',
                }
            }
        },
        created: function(){
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
        events: {
            resize: function(width){
                this.otherStyle.width = width/this.options.perSliders+'px';
                if(!!this.options.loop)
                    this.otherStyle.left = -width+'px';
            }
        }
    }
</script>
<style lang='less'>

</style>
