'use strict';

/**
 * The dev server config
 * @param {Number} compilerPort  devserver 编译端口
 * @param {Number} debugport  --inspect-port
 * @param {String} cliServicePath vue-cli 实例类路径
 * @param {String} vueCliContext vue.config.js 路径
 */
exports.webpackVueDevServer = {
  compilerPort: 9008,
  debugPort: 5801,
  cliServicePath: '',
  vueCliContext: '',
};
