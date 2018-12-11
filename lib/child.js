'use strict';

const DevServer = require('./dev-server');
const readWebpackMemoryFile = require('./readWebpackMemoryFile');

let compiler;

process.on('message', m => {
  if (m.action === 'building') {
    const { compilerPort, cliServicePath, vueCliContext } = m.config;
    // init vue-cli
    const Service = require(cliServicePath);
    const api = new Service(vueCliContext);
    api.init(m.mode);
    const webpackConfig = api.resolveWebpackConfig();
    const devServer = new DevServer(compilerPort);
    compiler = devServer.doCompile(webpackConfig, () => {
      process.send({ action: 'buildDone' });
    });
    devServer.createServer(compiler);
  } else if (m.action === 'file') {
    const { filePath, absolute } = m;
    const fileContent = readWebpackMemoryFile(compiler, filePath, absolute);
    process.send({ action: 'file', fileContent, filePath });
  }
});
