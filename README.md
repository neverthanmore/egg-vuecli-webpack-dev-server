# egg-vuecli-webpack-dev-server

A dev server by use vuecli3 and egg

## install

```base
$ npm i egg-vuecli-webpack-dev-server --D
```

## Usage

```js
// {app_root}/config/plugin.local.js
exports.view = {
  enable: true,
  package: 'egg-vuecli-webpack-dev-server'
};
```

Configure information in \${app_root}/config/config.local.js

```js
exports.webpackVueDevServer = {
  cliServicePath: path.resolve(__dirname, '../../client/node_modules/@vue/cli-service/lib/Service'),
  vueCliContext: path.resolve(__dirname, '../../client')
};
```

Change babel.config.js options cwd

```js
config.module
  .rule('js')
  .use('babel-loader')
  .loader('babel-loader')
  .tap(options => {
    // 修改它的选项...
    return Object.assign(options || {}, {
      cwd: __dirname
    });
  });
```
