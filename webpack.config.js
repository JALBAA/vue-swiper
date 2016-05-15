module.exports = {
    entry: "./src/main.js",
    output: {
        path: __dirname,
        filename: "./build/vue-swiper.js"
    },
    module: {
        loaders: [
            {test: /\.vue$/, loader: "vue"},
            { test: /\.css$/, loader: "style!css" }
        ]
    }
};
