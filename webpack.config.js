var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
 
module.exports = {
  entry: {
    'polyfills': './angular/polyfills.ts',
    'vendor': './angular/vendor.ts',
    'comments': './angular/comments/app/main.ts',
  },
    output: {
        path: path.resolve('dist'),
        publicPath: '/dist',
        filename: '[name].js'
      },
  resolve: {
    extensions: ['.ts', '.js']
  },
 
  module: {
    rules: [
      {
        test: /\.ts$/,
        loaders: [{
          loader: 'awesome-typescript-loader',
          options: { configFileName: path.resolve('tsconfig.json') }
        } , 'angular2-template-loader']
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
      test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
      loader: 'file-loader?name=assets/[name].[ext]'
    },
    {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract({ fallbackLoader: 'style-loader', loader: 'css-loader?sourceMap' })
    }]
  },
 
  plugins: [
    new HtmlWebpackPlugin({
      template: 'angular/comments/index.html',
      filename: 'comments.html',
      chunks: ['polyfills', 'vendor', 'comments']
    }),

    new ExtractTextPlugin('[name].css'),

    new webpack.NoEmitOnErrorsPlugin(),
     
    new webpack.optimize.UglifyJsPlugin({ 
      mangle: {
        keep_fnames: true
      }
    }),
     
    new webpack.LoaderOptionsPlugin({
      htmlLoader: {
        minimize: false
      }
    }),
  ]
};