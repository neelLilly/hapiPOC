import Joi from "joi";

export const addFavoriteSchema = Joi.object({
    productId: Joi.string().uuid().required()
});
