'use strict';

const open = require('opn');
const fs = require('fs');
const path = require('path');
const { EVENT_WEBPACK_BUILD_STATE, EVENT_OPEN_BROWSER, PROXY_MAPPING } = require('./lib/constant');
const getIp = require('./lib/getIp');

module.exports = class appServerBoot {
  constructor(app) {
    this.app = app;
    this.config = app.config.webpackVueDevServer;
    this.ingorePath = this.config.ignorePath;
    this.compilerPort = app.config.webpackVueDevServer.compilerPort;
  }

  configDidLoad() {
    const { app } = this;
    const { autoOpn, opnPath } = this.config;
    app.messenger.setMaxListeners(10000);
    app.messenger.on(EVENT_WEBPACK_BUILD_STATE, data => {
      app.webpackBuildSuccess = data.state;
    });

    app.messenger.on(EVENT_OPEN_BROWSER, () => {
      autoOpn && open(`http://${getIp()}:${app.options.port}${opnPath}`);
    });

    // add middleware
    app.use(async (ctx, next) => {
      if (app.webpackBuildSuccess) {
        await next();
      } else {
        ctx.set('Content-Type', 'text/html');
        if (app.webpackLoadingText) {
          ctx.body = ctx.webpackLoadingText;
        } else {
          const filepath = path.resolve(__dirname, './loading.html');
          ctx.body = app.webpackLoadingText = fs.readFileSync(filepath);
        }
      }
    });

    app.use(async (ctx, next) => {
      const imgRegex = /\.(png|jpe?g|gif|svg)(\?.*)?$/;
      const p = ctx.path;
      const suffix = path.extname(p).toLocaleLowerCase();
      let isIngore = false;

      if (typeof this.ingorePath === 'string' && this.ingorePath) {
        this.ingorePath = [ this.ingorePath ];
      }

      if (Object.prototype.toString.call(this.ingorePath) === '[object Array]') {
        isIngore = this.ingorePath.some(p => {
          if(p instanceof RegExp) {
            return p.test(ctx.path);
          }
          return p === ctx.path;
        });
      }

      if (isIngore) {
        await next()
      } else {
        if (suffix in PROXY_MAPPING) {
          ctx.set('Content-Type', PROXY_MAPPING[suffix]);
          const content = await app.fileSystem.readWebpackMemoryFile(p, suffix, true);
          if (content) {
            ctx.body = content;
          } else {
            await next();
          }
        } else if (imgRegex.test(suffix)) {
          const res = await ctx.curl(`http://127.0.0.1:${this.compilerPort}${p}`, {
            streaming: true,
          });
          ctx.type = suffix.slice(1);
          ctx.body = res.res;
        } else {
          await next();
        }
      }
    });
  }

  async didReady() {
    const { app } = this;
    app.messenger.sendToAgent(EVENT_WEBPACK_BUILD_STATE);
  }
};
