const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().trim().required(),

  email: Joi.string().email().lowercase().required(),

  password: Joi.string().min(6).required(),

  role: Joi.string().valid("buyer", "seller", "admin").default("buyer"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).required(),
});

module.exports = { registerSchema, loginSchema };
