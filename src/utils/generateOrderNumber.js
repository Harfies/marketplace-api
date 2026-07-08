const Counter = require("../models/counter");

const generateOrderNumber = async () => {
  const counter = await Counter.findOneAndUpdate(
    { _id: "orderNumber" },
    { $inc: { sequenceValue: 1 } },
    {
      upsert: true,
      returnDocument: "after",
    },
  );

  return `ORD-${new Date().getFullYear()}-${String(
    counter.sequenceValue,
  ).padStart(6, "0")}`;
};

module.exports = generateOrderNumber;
