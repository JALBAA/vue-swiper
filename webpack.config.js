var precss       = require('precss');
var autoprefixer = require('autoprefixer');
module.exports = {
    entry: "./src/main.js",
    output: {
        path: __dirname,
        filename: "./build/vue-swiper.js",
        library: ['Swiper'],
        libraryTarget: 'umd',
    },
    module: {
        loaders: [
            {test: /\.vue$/, loader: "vue"},
            {test: /\.css$/, loader: 'style-loader!postcss-loader'},
            {test: /\.less$/,loader: "less-loader!postcss-loader"},
            {
              test: /\.js$/, loader: 'babel-loader',
              query: {
                presets: ['es2015']
              }
            }
        ]
    },
    postcss: function () {
        return {
            defaults: [precss, autoprefixer],
            cleaner:  [autoprefixer({ browsers: ['Chrome 20'] })]
        };
    }
};
