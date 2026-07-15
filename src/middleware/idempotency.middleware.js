const redisClient = require("../config/redis");

const idempotency = async (req, res, next) => {
  try {
    const key = req.header("Idempotency-Key");

    if (!key) {
      return next();
    }

    const redisKey = `idempotency:${key}`;

    const cachedResponse = await redisClient.get(redisKey);

    if (cachedResponse) {
      logger.info(" IDEMPOTENCY HIT");

      return res.status(200).json(JSON.parse(cachedResponse));
    }

    logger.info(" IDEMPOTENCY MISS");

    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        await redisClient.set(redisKey, JSON.stringify(body), {
          EX: 60 * 60, // 1 hour
        });

        logger.info(" Response stored for idempotency");
      }

      return originalJson(body);
    };

    next();
  } catch (err) {
    logger.error(err);
    next();
  }
};

module.exports = idempotency;
