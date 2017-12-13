const getDuration = (start) => {
  const diff = process.hrtime(start);
  return (diff[0] * 1e3) + (diff[1] * 1e-6);
};

const getMessage = (req, res, duration) => {
  const contentLength = res.get('content-length') || '';

  return `${req.method} ${req.originalUrl || req.url} ${res.statusCode} ${contentLength} ${duration} ms`;
};


module.exports = (logger = console) => {
  const middleware = (req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
      logger.info(getMessage(req, res, getDuration(start)), { req, res }, 'express');
    });

    res.on('close', () => {
      logger.warn(getMessage(req, res, getDuration(start)), { req, res }, 'express');
    });

    next();
  };

  return middleware;
};
