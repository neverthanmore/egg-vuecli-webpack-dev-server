'use strict';

const path = require('path');

module.exports = (compiler, filePath, absolute) => {
  if (absolute) {
    const webpackConfig = compiler.options;
    filePath = path.join(webpackConfig.output.path, filePath);
  }
  let compilers = compiler.compilers || compiler;
  compilers = Array.isArray(compilers) ? compilers : [ compilers ];
  const fileCompiler = compilers.filter(item => item.outputFileSystem.existsSync(filePath));
  if (fileCompiler && fileCompiler.length) {
    return fileCompiler[0].outputFileSystem.readFileSync(filePath).toString('utf-8');
  }

  return `${filePath} 路径不存在`;
};
