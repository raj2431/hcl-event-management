
import Joi from "joi";

const eventFields = {
  title: Joi.string().trim().min(3).max(150),
  description: Joi.string().trim().min(10).max(5000),
  category: Joi.string().trim().min(2).max(100),
  venue: Joi.string().trim().min(2).max(200),
  city: Joi.string().trim().min(2).max(100),
  startDate: Joi.string().isoDate(),
  endDate: Joi.string().isoDate(),
  price: Joi.number().min(0).max(1_000_000),
  capacity: Joi.number().integer().min(1).max(1_000_000),
  status: Joi.string().valid("draft", "published", "cancelled"),
};

export const createEventSchema = Joi.object({
  ...eventFields,
  title: eventFields.title.required(),
  description: eventFields.description.required(),
  category: eventFields.category.required(),
  venue: eventFields.venue.required(),
  city: eventFields.city.required(),
  startDate: eventFields.startDate.required(),
  endDate: eventFields.endDate.required(),
  price: eventFields.price.required(),
  capacity: eventFields.capacity.required(),
}).custom((event: any, helpers: any) => {
  if (new Date(event.endDate) <= new Date(event.startDate)) {
    return helpers.error("any.invalid", {
      message: "endDate must be later than startDate",
    });
  }

  return event;
}, "event date range validation");

export const updateEventSchema = Joi.object(eventFields)
  .min(1)
  .unknown(false);

export const eventIdSchema = Joi.string().guid({
  version: ["uuidv4", "uuidv5"],
});
