//pagenation.vue
<template>
    <ul class='pagination'>
        <page
        v-for='item in pageCount'
        track-by="$index"
        v-bind:index='$index'
        v-bind:style='[circle]'></page>
    </ul>
</template>
<script>
    import Page from './page.vue'
    module.exports = {
        props:[],
        data: function(){
            return {
                pageCount: 0,
                rem: 0
            }
        },
        components: {
            page: Page
        },
        computed: {
            circle: function(){
                if(this.$el.className.match(/cubic/)){
                    return {}
                }
                return {
                    'width': parseInt(.11*this.rem)+'px',
                    'height': parseInt(.11*this.rem)+'px'
                }
            }
        },
        created: function(){
            this.rem = parseInt(document.querySelector('html').style.fontSize);
            if(this.index == 0){
                this.isActive = true;
            }
        },
        events: {
            resize: function(width,pageCount){
                this.rem = parseInt(document.querySelector('html').style.fontSize);
                this.pageCount = pageCount;
            },
            idxChange: function(idx){
                var _idx = idx
                if(idx == this.pageCount)
                    _idx = 0
                else if(idx == -1)
                    _idx = this.pageCount-1
                this.$broadcast('idxChange', _idx)
            }
        }
    }
</script>
<style lang='less'>
    @point-size: 10px;
    .swiper-container {
        .pagination {
            display: block;
            width: 100%;
            position: absolute;
            z-index: 999;
            bottom: 0;
            height: @point-size * 1.5;
            font-size: 0;
            text-align: center;
            li {
                font-size: @point-size;
                line-height: @point-size * 1.5;
                display: inline-block;
                margin: 0 (@point-size / 2);
                width: @point-size;
                height: @point-size;
                border-radius: 50%;
                background-color: rgba(255,255,255,.6);
                &.active {
                    background-color: #fff;
                }
            }
        }
    }
</style>
