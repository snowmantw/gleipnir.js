'use strict';
/**
 * Why we expose a function rather a literal object?
 * It's because if we have some dynamic configs,
 * we can't use any static config in this file.
 */
module.exports = function(configs) {
  return {
    entry: configs.entries,
    devtool: 'inline-source-map',
    output: {
      library: ['Gleipnir', '[name]'],
      libraryTarget: 'var',
      filename: 'Gleipnir.[name].js'
    },
    resolve: { root: configs.path.stage },
    module: {
      loaders: [
        { test: /\.js$/,
          loader: 'babel-loader' }
      ]
    }
  }
};
