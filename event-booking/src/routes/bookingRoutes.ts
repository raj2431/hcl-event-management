
import { Router } from "express";
import Joi from "joi";

import {
  createBooking,
  listMyBookings,
  cancelMyBooking,
} from "../controllers/bookingController.js";

import { validate } from "../middleware/validate.js";
import { requireRole } from "../middleware/authenticate.js";

import {
  createBookingSchema,
  bookingIdSchema,
} from "../validators/bookingValidator.js";

const router = Router();


const bookingParamsSchema = Joi.object({
  bookingId: bookingIdSchema.required(),
}).unknown(false);

// Customer-only booking endpoints
router.post(
  "/",
  requireRole("customer"),
  validate(createBookingSchema),
  createBooking,
);

router.get(
  "/my",
  requireRole("customer"),
  listMyBookings,
);

router.patch(
  "/:bookingId/cancel",
  requireRole("customer"),
  validate(bookingParamsSchema, "params"),
  cancelMyBooking,
);

export default router;
