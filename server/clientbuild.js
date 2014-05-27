/*
 * Handles bundling of our client side app with Webpack
 */

var extend = require('../client/js/misc/extend')

  , RUNFLAG = process.env.NODE_ENV || 'dev'

  , buildConfig = {
    recursive:  true,
    cache:  false,

    module: {
    loaders: [
    { test: /\-jsx.js$/, loader: 'jsx' },
      { test: /\.svg/, loader: 'url?limit=10000&mimetype=image/svg+xml' },
      { test: /\.ttf/, loader: 'url?limit=10000&mimetype=application/x-font-ttf' },
      { test: /\.otf/, loader: 'url?limit=10000&mimetype=application/x-font-opentype' },
      { test: /\.woff/, loader: 'url?limit=10000&mimetype=application/font-woff' },
      { test: /\.eot/, loader: 'url?limit=10000&mimetype=application/vnd.ms-fontobject' },
      { test: /\.gif/, loader: 'url?limit=10000&mimetype=image/gif' },
      { test: /\.png/, loader: 'url?limit=100000&mimetype=image/png' },
      { test: /\.less$/, loader: 'style!css!less' },
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.styl$/, loader: 'style!css!stylus' }
  ]
  },

    optimize: {
      minimize: RUNFLAG != 'dev'
    },

      resolve: {
        modulesDirectories: ['bower_components', 'node_modules']
      }
  }
  , webpack = require('webpack')
  , sandbox = require('enhanced-require')(module, buildConfig)
;

module.exports = {
  render: sandbox,

  bundle: function(base, cb) {
    var cfg = {
      context: base + '/client/',
      entry:   base + '/client/app-jsx',
      output: {
        path:       base + '/public',
        filename:   'bundle.js'
      }
    };

    extend(cfg, buildConfig);
    var wp = webpack(cfg);

    if(RUNFLAG == 'dev') {
      console.log('watching client-side build for dev changes to rebuild');
      wp.watch(200,cb);
    }
    else
      wp.run(cb); // run once in production at start up

    return wp;
  }
};