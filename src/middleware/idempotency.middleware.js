const redisClient = require("../config/redis");

const idempotency = async (req, res, next) => {
  try {
    // Read the Idempotency-Key header
    const key = req.header("Idempotency-Key");

    // If no key is provided, continue normally
    if (!key) {
      return next();
    }

    const redisKey = `idempotency:${key}`;

    // Check if we've already processed this request
    const cachedResponse = await redisClient.get(redisKey);

    if (cachedResponse) {
      console.log(" IDEMPOTENCY HIT");

      return res.status(200).json(JSON.parse(cachedResponse));
    }

    console.log(" IDEMPOTENCY MISS");

    // Save the original res.json
    const originalJson = res.json.bind(res);

    // Override res.json so we can cache successful responses
    res.json = async (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        await redisClient.set(redisKey, JSON.stringify(body), {
          EX: 60 * 60, // 1 hour
        });

        console.log(" Response stored for idempotency");
      }

      return originalJson(body);
    };

    next();
  } catch (err) {
    console.error(err);
    next();
  }
};

module.exports = idempotency;
