const { createClient } = require("redis");
const logger = require("../logger/logger");

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("connect", () => {
  logger.info(" Redis Connected");
});

redisClient.on("error", (err) => {
  logger.info(" Redis Error:", err);
});

(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;
