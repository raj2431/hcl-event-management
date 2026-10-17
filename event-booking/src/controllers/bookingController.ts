
import type { Request, Response, NextFunction } from "express";

import * as bookingService from "../services/bookingService.js";
import { HttpError } from "../utils/HttpError.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customer = req.user;

    if (!customer?.id) {
      throw new HttpError(401, "Authentication required");
    }

    if (customer.role !== "customer") {
      throw new HttpError(403, "Customer access required");
    }

    const booking = await bookingService.createBooking({
      eventId: req.body.eventId,
      customerId: customer.id,
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      seats: req.body.seats,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const listMyBookings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customer = req.user;

    if (!customer?.id) {
      throw new HttpError(401, "Authentication required");
    }

    const bookings = await bookingService.getCustomerBookings(
      customer.id,
    );

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelMyBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const customer = req.user;

    if (!customer?.id) {
      throw new HttpError(401, "Authentication required");
    }

    const bookingId = req.params.bookingId;
    if(typeof bookingId !== 'string') {
        throw new HttpError(400, "Invalid booking ID");
    }
    const booking = await bookingService.cancelBooking(
      bookingId,
      customer.id,
    );

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
