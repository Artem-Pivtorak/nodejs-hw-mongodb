import Joi from 'joi';

export const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().required(),
  contactType: Joi.string().valid('personal', 'business').required(),
  photo: Joi.string().optional(),
    userId: Joi.string()
    .length(24)
    .hex()
    .required()
});
