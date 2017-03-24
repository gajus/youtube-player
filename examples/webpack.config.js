var path,
  webpack;

webpack = require('webpack');
path = require('path');

module.exports = {
  devtool: 'source-map',
  context: path.resolve(__dirname, './src'),
  entry: {
    'youtube-player': './youtube-player.js'
  },
  devServer: {
    contentBase: path.resolve(__dirname, './src'),
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
    path: __dirname,
    filename: '[name].js',
    publicPath: '/'
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, './src'),
        loader: 'babel-loader'
      }
    ]
  }
};
