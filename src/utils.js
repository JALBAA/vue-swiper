module.exports = {
    proxy: function(cb,scope){
        return function(){
            cb.apply(scope,arguments)
        }
    },
}
