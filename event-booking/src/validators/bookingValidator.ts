
import Joi from "joi";

export const bookingIdSchema = Joi.string()
  .guid({ version: ["uuidv4", "uuidv5"] });

export const createBookingSchema = Joi.object({
  eventId: Joi.string()
    .guid({ version: ["uuidv4", "uuidv5"] })
    .required(),

  customerName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  customerEmail: Joi.string()
    .trim()
    .email()
    .max(254)
    .required(),

  seats: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .required(),
}).unknown(false);
