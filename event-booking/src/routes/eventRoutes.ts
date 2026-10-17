
import { Router } from "express";
import Joi from "joi";

import {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";

import { validate } from "../middleware/validate.js";
import { requireRole } from "../middleware/authenticate.js";

import {
  createEventSchema,
  updateEventSchema,
  eventIdSchema,
} from "../validators/eventValidator.js";

const router = Router();

const eventParamsSchema = Joi.object({
  eventId: eventIdSchema.required(),
}).unknown(false);

// Public event endpoints
router.get("/", listEvents);

router.get(
  "/:eventId",
  validate(eventParamsSchema, "params"),
  getEventById,
);

// Admin-only event management
router.post(
  "/",
  requireRole("admin"),
  validate(createEventSchema),
  createEvent,
);

router.patch(
  "/:eventId",
  requireRole("admin"),
  validate(eventParamsSchema, "params"),
  validate(updateEventSchema),
  updateEvent,
);

router.delete(
  "/:eventId",
  requireRole("admin"),
  validate(eventParamsSchema, "params"),
  deleteEvent,
);

export default router;
