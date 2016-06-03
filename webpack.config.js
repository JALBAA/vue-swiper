module.exports = {
    entry: "./src/main.js",
    output: {
        path: __dirname,
        filename: "./build/vue-swiper.js",
        library: ['Swiper'],
        libraryTarget: 'var',
    },
    module: {
        loaders: [
            {test: /\.vue$/, loader: "vue"},
            {test: /\.css$/, loader: "style!css" },
            {test: /\.less$/,loader: "style!less"},
            {
              test: /\.js$/, loader: 'babel-loader',
              query: {
                presets: ['es2015']
              }
            }
        ]
    }
};
