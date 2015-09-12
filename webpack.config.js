var webpack;

webpack = require('webpack');

module.exports = {
    devtool: 'source-map',
    context: __dirname + '/src',
    entry: {
        'youtube-player': './browser.js'
    },
    devServer: {
        contentBase: __dirname + '/examples/',
        colors: true,
        quiet: false,
        noInfo: false,
        publicPath: '/',
        historyApiFallback: false,
        host: '127.0.0.1',
        port: 8000,
        hot: true
    },
    output: {
        path: __dirname + '/dist/browser',
        filename: '[name].js',
        publicPath: '/'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            // minimize: true,
            compress: {
                warnings: false
            }
        }),
        new webpack.OldWatchingPlugin(),
        // new webpack.NewWatchingPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.NoErrorsPlugin()
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: [
                    /node_modules/
                ],
                loader: 'babel'
            }
        ]
    },
    resolve: {
        extensions: [
            '',
            '.js'
        ]
    }
};
