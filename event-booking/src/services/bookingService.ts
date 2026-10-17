
import { randomInt, randomUUID } from "node:crypto";

import type { Booking } from "../types/booking.js";
import type { Event } from "../types/event.js";
import * as bookingRepository from "../repositories/bookingRepository.js";
import * as eventRepository from "../repositories/eventRepository.js";
import { HttpError } from "../utils/HttpError.js";

export interface CreateBookingCommand {
  eventId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  seats: number;
}

export const createBooking = async (
  input: CreateBookingCommand,
): Promise<Booking> => {
  const event = await eventRepository.getEventById(input.eventId);

  if (!event || event.status !== "published") {
    throw new HttpError(404, "Published event not found");
  }

  if (new Date(event.startDate).getTime() <= Date.now()) {
    throw new HttpError(400, "This event has already started");
  }

  if (
    !Number.isInteger(input.seats) ||
    input.seats < 1 ||
    input.seats > 10
  ) {
    throw new HttpError(400, "Seats must be between 1 and 10");
  }

  const existingBookings =
    await bookingRepository.getBookingsByEvent(event.id);

  const bookedSeats = existingBookings
    .filter((booking) => booking.status === "confirmed")
    .reduce((total, booking) => total + booking.seats, 0);

  const availableSeats = event.capacity - bookedSeats;

  if (input.seats > availableSeats) {
    throw new HttpError(
      409,
      `Only ${Math.max(availableSeats, 0)} seats are available`,
    );
  }

  const bookingReference =
    `EVT-${randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;

  return bookingRepository.saveBooking({
    bookingReference,
    eventId: event.id,
    customerId: input.customerId,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    seats: input.seats,
    totalAmount: Number((event.price * input.seats).toFixed(2)),
    status: "confirmed",
    paymentStatus: "pending",
  });
};

export const getCustomerBookings = async (
  customerId: string,
): Promise<Booking[]> => {
  return bookingRepository.getBookingsByCustomer(customerId);
};

export const cancelBooking = async (
  bookingId: string,
  customerId: string,
): Promise<Booking> => {
  const booking = await bookingRepository.getBookingById(bookingId);

  if (!booking || booking.customerId !== customerId) {
    throw new HttpError(404, "Booking not found");
  }

  if (booking.status === "cancelled") {
    throw new HttpError(409, "Booking is already cancelled");
  }

  if (booking.paymentStatus === "paid") {
    throw new HttpError(
      409,
      "Paid bookings require the payment refund workflow",
    );
  }

  const event: Event | undefined =
    await eventRepository.getEventById(booking.eventId);

  if (event && new Date(event.startDate).getTime() <= Date.now()) {
    throw new HttpError(
      400,
      "Booking cannot be cancelled after the event starts",
    );
  }

  const updatedBooking = await bookingRepository.updateBooking(
    bookingId,
    { status: "cancelled" },
  );

  if (!updatedBooking) {
    throw new HttpError(404, "Booking not found");
  }

  return updatedBooking;
};
