'use strict';

/**
 * The dev server config
 * @param {Boolean} autoOpn 是否需要自动打开页面
 * @param {String} opnPath 打开地址的路径
 * @param {Number} compilerPort  devserver 编译端口
 * @param {Number} debugport  --inspect-port
 * @param {String} cliServicePath vue-cli 实例类路径
 * @param {String} vueCliContext vue.config.js 路径
 */
exports.webpackVueDevServer = {
  autoOpn: true,
  opnPath: '/',
  compilerPort: 9008,
  debugPort: 5801,
  cliServicePath: '',
  vueCliContext: '',
  ignorePath: ''
};
