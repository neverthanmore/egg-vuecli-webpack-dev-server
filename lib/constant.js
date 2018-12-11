'use strict';

// webpack 编译状态
exports.EVENT_WEBPACK_BUILD_STATE = 'webpack_build_state';

exports.EVENT_WEBPACK_READ_FILE_MEMORY = 'webpack_read_file_memory';

exports.EVENT_WEBPACK_CONTENT_FROM_MEMORY = 'webpack_content_from_memory';

exports.EVENT_OPEN_BROWSER = 'open_browser';

exports.PROXY_MAPPING = {
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.map': 'application/json; charset=UTF-8',
};
