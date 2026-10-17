
import { randomUUID } from "node:crypto";
import path from "node:path";

import type { Booking } from "../types/booking.js";
import {
  initializeJsonFile,
  readJsonFile,
  writeJsonFile,
} from "../utils/jsonStorage.js";

const BOOKINGS_FILE = path.resolve("data", "bookings.json");

const ensureBookingsFile = async (): Promise<void> => {
  await initializeJsonFile(BOOKINGS_FILE, []);
};

export const getAllBookings = async (): Promise<Booking[]> => {
  await ensureBookingsFile();
  return readJsonFile<Booking>(BOOKINGS_FILE);
};

export const getBookingById = async (
  bookingId: string,
): Promise<Booking | undefined> => {
  const bookings = await getAllBookings();
  return bookings.find((booking) => booking.id === bookingId);
};

export const getBookingsByCustomer = async (
  customerId: string,
): Promise<Booking[]> => {
  const bookings = await getAllBookings();

  return bookings.filter(
    (booking) => booking.customerId === customerId,
  );
};

export const getBookingsByEvent = async (
  eventId: string,
): Promise<Booking[]> => {
  const bookings = await getAllBookings();

  return bookings.filter(
    (booking) => booking.eventId === eventId,
  );
};

export const saveBooking = async (
  input: Omit<Booking, "id" | "createdAt" | "updatedAt">,
): Promise<Booking> => {
  const bookings = await getAllBookings();
  const now = new Date().toISOString();

  const booking: Booking = {
    ...input,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  await writeJsonFile(BOOKINGS_FILE, [...bookings, booking]);

  return booking;
};

export const updateBooking = async (
  bookingId: string,
  changes: Partial<
    Pick<Booking, "status" | "paymentStatus">
  >,
): Promise<Booking | undefined> => {
  const bookings = await getAllBookings();
  const index = bookings.findIndex(
    (booking) => booking.id === bookingId,
  );

  if (index === -1) {
    return undefined;
  }

  const existingBooking = bookings[index];

  if (!existingBooking) {
    return undefined;
  }

  const updatedBooking: Booking = {
    ...existingBooking,
    ...changes,
    id: existingBooking.id,
    eventId: existingBooking.eventId,
    customerId: existingBooking.customerId,
    seats: existingBooking.seats,
    totalAmount: existingBooking.totalAmount,
    createdAt: existingBooking.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const updatedBookings = [...bookings];
  updatedBookings[index] = updatedBooking;

  await writeJsonFile(BOOKINGS_FILE, updatedBookings);

  return updatedBooking;
};
