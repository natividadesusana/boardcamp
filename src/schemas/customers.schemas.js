import Joi from 'joi';

const customerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  phone: Joi.string().pattern(new RegExp('^\\d{11}$')).required(),
  cpf: Joi.string().pattern(new RegExp('^\\d{11}$')).required(),
  birthday: Joi.date().max('now').required(),
});

export default customerSchema;
