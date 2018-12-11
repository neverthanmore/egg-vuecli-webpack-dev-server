'use strict';

const Engine = require('../../lib/fileSystem');
const FILESYSTEM = Symbol('Application#fileSystem');

module.exports = {
  get fileSystem() {
    if (!this[FILESYSTEM]) {
      this[FILESYSTEM] = new Engine(this);
    }
    return this[FILESYSTEM];
  },
};
