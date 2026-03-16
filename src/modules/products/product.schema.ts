import Joi from "joi";

export const createProductSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    price: Joi.number().positive().required(),
    stock: Joi.number().integer().min(0).default(0)
});

export const updateProductSchema = Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    price: Joi.number().positive().optional(),
    stock: Joi.number().integer().min(0).optional()
});

export const bulkCreateProductsSchema = Joi.array().items(createProductSchema).min(1);
