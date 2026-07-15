const logger = require("../logger/logger");

module.exports = (err, req, res, next) => {
  logger.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message,
  });
};
