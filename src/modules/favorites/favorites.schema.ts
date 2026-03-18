import Joi from "joi";

export const favoriteProductIdParamSchema = Joi.object({
    productId: Joi.string().required()
});

export const addFavoriteSchema = Joi.object({
    productId: Joi.string().uuid().required()
});
