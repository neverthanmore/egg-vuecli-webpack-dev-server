'use strict';
const { EVENT_WEBPACK_READ_FILE_MEMORY, EVENT_WEBPACK_CONTENT_FROM_MEMORY } = require('./constant');

class FileSystem {
  constructor(app) {
    this.app = app;
  }

  readWebpackMemoryFile(filePath, fileName, absolute = false) {
    return new Promise(resolve => {
      this.app.messenger.sendToAgent(EVENT_WEBPACK_READ_FILE_MEMORY, {
        filePath,
        fileName,
        absolute,
      });
      this.app.messenger.on(EVENT_WEBPACK_CONTENT_FROM_MEMORY, data => {
        if (filePath === data.filePath) {
          resolve(data.fileContent);
        }
      });
    });
  }
}

module.exports = FileSystem;
