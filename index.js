const getDuration = (start) => {
  const diff = process.hrtime(start);
  return (diff[0] * 1e3) + (diff[1] * 1e-6);
};

const getMessage = (req, res, duration) => {
  const contentLength = res.get('content-length') || '';

  return `${req.method} ${req.originalUrl || req.url} ${res.statusCode} ${contentLength} ${duration} ms`;
};

const removeEventListeners = (res, onFinish, onClose) => {
  res.removeListener('finish', onFinish);
  res.removeListener('close', onClose);
};

module.exports = (logger = console) => {
  const middleware = (req, res, next) => {
    const start = process.hrtime();
    let onClose;
    const onFinish = () => {
      logger.info(getMessage(req, res, getDuration(start)), { req, res }, 'express');
      removeEventListeners(res, onFinish, onClose);
    };

    onClose = () => {
      logger.warn(getMessage(req, res, getDuration(start)), { req, res }, 'express');
      removeEventListeners(res, onFinish, onClose);
    };

    res.on('finish', onFinish);
    res.on('close', onClose);

    next();
  };

  return middleware;
};
