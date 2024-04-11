const Joi = require("joi");

const listingSchema = Joi.object({
  listing: Joi.object({
    name: Joi.string().required(),
    image: Joi.string(),
    price: Joi.number().min(1).required(),
    description: Joi.string(),
  }).required(),
});

module.exports={listingSchema};
