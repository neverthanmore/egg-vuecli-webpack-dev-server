'use strict';

const webpack = require('webpack');
const path = require('path');
const getIp = require('./getIp');
const koa = require('koa');
const KoaWebpackDevMiddleware = require('koa-webpack-dev-middleware');
const KoaWebpackHotMiddleware = require('koa-webpack-hot-middleware');
const cors = require('@koa/cors');
const chalk = require('chalk');

class DevServer {
  constructor(port) {
    this.port = port;
    this.isFirstCompiler = true;
  }

  doCompile(webpackConfig, callback) {
    console.log(chalk.green('build for development start...'));
    this.addHotEntry(webpackConfig);
    const compiler = webpack(webpackConfig);
    compiler.hooks.done.tap('webpack-compile-done', compilation => {
      if (this.isFirstCompiler) {
        this.isFirstCompiler = false;
        callback && callback(compilation);
      }
    });
    return compiler;
  }

  addHotEntry(webpackConfig) {
    const host = getIp();
    const hotMiddlewares = require.resolve('webpack-hot-middleware').split(path.sep);
    hotMiddlewares.pop();
    const hotConfig = { noInfo: false, reload: false, quiet: false };
    const hotInfo = [
      `${path.posix.join(hotMiddlewares.join(path.sep))}/client?path=http://${host}:${this.port}/__webpack_hmr`,
    ];

    for (const [ key, val ] of Object.entries(hotConfig)) {
      hotInfo.push(`${key}=${val}`);
    }

    const hotEntry = [ hotInfo.join('&') ];
    for (const [ key, value ] of Object.entries(webpackConfig.entry)) {
      webpackConfig.entry[key] = hotEntry.concat(value);
    }
  }

  createServer(compiler) {
    const { port } = this;
    const webpackConfig = compiler.options;
    const app = new koa();

    const devOptions = {
      publicPath: webpackConfig.output.publicPath,
      stats: {
        colors: true,
        children: true,
        modules: false,
        chunks: false,
        chunkModules: false,
        entrypoints: false,
      },
      headers: {
        'cache-control': 'max-age=0',
      },
      watchOptions: {
        ignored: /node_modules/,
      },
    };

    app.use(cors());

    const devMiddleware = KoaWebpackDevMiddleware(compiler, devOptions);
    app.use(devMiddleware);

    const hotMiddleware = KoaWebpackHotMiddleware(compiler, {
      log: false,
      reload: true,
    });
    app.use(hotMiddleware);

    app.listen(port, err => {
      if (!err) {
        const url = `http://${getIp()}:${port}`;
        console.info(chalk.green(`\r\n [webpack-ssr-dev-server] start webpack building server: ${url}`));
      }
    });
  }
}

module.exports = DevServer;
