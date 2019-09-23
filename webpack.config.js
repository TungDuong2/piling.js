const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const VERSION = require('./version.js');

module.exports = (env, argv) => ({
  entry: {
    index: './examples/index.js'
  },
  output: {
    path: `${__dirname}/examples-build`,
    publicPath: argv.mode === 'production' ? './' : '/'
  },
  devServer: {
    contentBase: './examples'
  },
  module: {
    rules: [
      {
        test: /\.(js|fs|vs)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'examples/index.html',
      filename: 'index.html',
      chunks: ['index']
    }),
    new webpack.DefinePlugin({ VERSION })
  ]
});
