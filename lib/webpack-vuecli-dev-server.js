'use strict';

const childProcess = require('child_process');
const path = require('path');
const {
  EVENT_WEBPACK_BUILD_STATE,
  EVENT_WEBPACK_READ_FILE_MEMORY,
  EVENT_WEBPACK_CONTENT_FROM_MEMORY,
  EVENT_OPEN_BROWSER,
} = require('./constant');

class WebpackVuecliDevServer {
  constructor(config, agent) {
    this.config = config;
    this.agent = agent;
    this.mode = 'development';
    this.buildDone = false;
  }

  fork() {
    this.forkChild();
    this.agent.messenger.on(EVENT_WEBPACK_BUILD_STATE, () => {
      this.sendToApp();
    });
  }

  forkChild() {
    const { config, agent, mode } = this;
    const debugPort = process.env.WEBPACK_CLI_DEBUG_PORT || config.debugPort;
    let execArgv = [];

    if (agent.options && agent.options.isDebug) {
      execArgv.push(...process.execArgv);
      execArgv.pop();
      execArgv.push(`--inspect-port=${debugPort}`);
    } else {
      execArgv = process.execArgv;
    }

    const child = childProcess.fork(path.join(__dirname, './child.js'), [], { execArgv });

    child.on('message', m => {
      if (m.action === 'buildDone') {
        this.buildDone = true;
        this.sendToApp();
        if (this.buildDone) {
          this.agent.messenger.sendToApp(EVENT_OPEN_BROWSER);
        }
      } else if (m.action === 'file') {
        // 获取到内存文件, 然后发送给 Egg Worker
        this.agent.messenger.sendToApp(EVENT_WEBPACK_CONTENT_FROM_MEMORY, {
          fileContent: m.fileContent,
          filePath: m.filePath,
        });
      }
    });

    // 发送消息给子进程，触发webpack编译，并启动dev-server
    child.send({
      mode,
      config,
      action: 'building',
      baseDir: this.agent.baseDir,
    });

    // 监听去webpack内存中读取静态资源请求
    agent.messenger.on(EVENT_WEBPACK_READ_FILE_MEMORY, data => {
      child.send({ action: 'file', filePath: data.filePath, absolute: data.absolute });
    });

    // 关闭服务，kill子进程
    [ 'SIGINT', 'SIGQUIT', 'SIGTERM', 'exit' ].forEach(event => {
      process.once(event, () => {
        childProcess.spawn('kill', [ child.pid ]);
      });
    });
  }

  sendToApp() {
    if (this.buildDone) {
      this.agent.messenger.send(EVENT_WEBPACK_BUILD_STATE, {
        state: true,
        port: this.config.compilerPort,
      });
    }
  }
}

module.exports = WebpackVuecliDevServer;
