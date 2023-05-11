import joi from "joi";

const gameSchema = joi.object({
  name: joi.string().trim().min(1).required(),
  image: joi.string().required(),
  stockTotal: joi.number().integer().greater(0).required(),
  pricePerDay: joi.number().greater(0).required(),
});

export default gameSchema;
