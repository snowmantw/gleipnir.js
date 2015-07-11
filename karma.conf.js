// Karma configuration
// Generated on Wed Mar 25 2015 17:04:18 GMT+0800 (CST)

module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai', 'sinon'],
    files: [
      'tests.bundle.js'
    ],
    preprocessors: {
      'tests.bundle.js': [ 'webpack' ]
    },
    webpack: {
      resolve: { root: __dirname },
      module: {
        loaders: [
          { exclude: /node_modules/,
            test: /\.js$/,
            loader: 'babel-loader' }
        ]
      }
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Firefox'],
    singleRun: false,
    babelPreprocessor: {
      options: {
        sourceMap: 'inline',
        modules: 'amd',
        resolveModuleSource: function(source, file) {
          // Since Karma serve files under '/base', but to add it to
          // every importing path is unaccetable, so we append it here.
          var prefix = new RegExp('^\/base');
          if (!prefix.test(source)) {
            source = '/base/' + source;
          }
          return source;
        }
      },
      filename: function(file) {
        return file.originalPath;
      },
      sourceFileName: function(file) {
        return file.originalPath;
      }
    }
  });
};
