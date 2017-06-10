'use strict';

const bunyan = require('bunyan');
const correlator = require('correlation-id');

module.exports = function(options) {
  const logger = bunyan.createLogger({ name: 'nocms-express' });

  return function(req, res, next) {
    const start = process.hrtime()
    const id = req.get('x-correlation-id');

    if (id) {
      correlator.withId(id);
    }

    let obj = {
      express: {
        correlationId: correlator.getId(),
        req: {
          method: req.method,
          url: req.originalUrl || req.url,
          user: req.user || '',
          query: req.query,
          httpVersion: `${req.httpVersionMajor}.${req.httpVersionMinor}`,
          remoteAddress: req.connection.remoteAddress,
          remotePort: req.connection.remotePort
        }
      }
    };

    res.on('finish', function() {
      obj.express.res = {
        statusCode: res.statusCode,
        contentLength: res.get("content-length") || '',
        duration: getDuration(start)
      };
      logger.info(obj, `${obj.express.req.remoteAddress} ${obj.express.req.user} HTTP/${obj.express.req.httpVersion} ${obj.express.req.method} ${obj.express.req.url} ${obj.express.res.statusCode} ${obj.express.res.contentLength} ${obj.express.res.duration} ms`);
    });

    res.on('close', function () {
      obj.express.res = {
        statusCode: res.statusCode,
        contentLength: res.get("content-length") || '',
        duration: getDuration(start)
      };
      logger.warn(obj, `${obj.express.req.remoteAddress} ${obj.express.req.user} HTTP/${obj.express.req.httpVersion} ${obj.express.req.method} ${obj.express.req.url} ${obj.express.res.statusCode} ${obj.express.res.contentLength} ${obj.express.res.duration} ms`);
    });

    next()
  }

  function getDuration(start) {
    var diff = process.hrtime(start);
    return diff[0] * 1e3 + diff[1] * 1e-6;
  }
}
