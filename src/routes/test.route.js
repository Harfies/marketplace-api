const router = require("express").Router();
const redisClient = require("../config/redis");

router.get("/redis", async (req, res) => {
  try {
    await redisClient.set("test", "Hello Redis Cloud");

    const value = await redisClient.get("test");

    res.json({
      success: true,
      value,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
