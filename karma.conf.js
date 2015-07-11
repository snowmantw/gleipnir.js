// Karma configuration
// Generated on Wed Mar 25 2015 17:04:18 GMT+0800 (CST)

module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai', 'sinon'],
    files: [
      'tests.bundle.js'
    ],
    preprocessors: {
      'tests.bundle.js': [ 'webpack', 'sourcemap' ]
    },
    webpack: {
      devtool: 'inline-source-map',
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
    singleRun: true
  });
};
