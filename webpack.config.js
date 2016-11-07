var path = require('path');
var openBrowser = require('open-browser-webpack-plugin');

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: './index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'ship_breakers.js',
    publicPath: ''
  },
  devServer: {
    contentBase: "public/"
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.jsx', '.js']
  },
  url: {
    dataUrlLimit: 1024
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.styl$/, loader: 'style-loader!css-loader!stylus-loader' },
      {test: /\.svg/, loader: 'svg-url-loader'}
    ],
    preLoaders: [
      { test: /\.js$/, loader: 'source-map-loader' }
    ]
  },
  plugins: [
    new openBrowser()
  ]
}
