
import type { Request, Response, NextFunction } from "express";

import * as eventRepository from "../repositories/eventRepository.js";
import { HttpError } from "../utils/HttpError.js";
import type {
  CreateEventInput,
  UpdateEventInput,
} from "../types/event.ts";

export const listEvents = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const events = await eventRepository.getAllEvents();

    // Public users should only see published events.
    const visibleEvents = events.filter(
      (event) => event.status === "published",
    );

    res.status(200).json({
      success: true,
      data: visibleEvents,
    });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const eventId = req.params.eventId;

    if (typeof eventId !== "string") {
      throw new HttpError(400, "Invalid booking ID");
    }

    const event = await eventRepository.getEventById(
      eventId
    );

    if (!event || event.status !== "published") {
      throw new HttpError(404, "Event not found");
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input = req.body as CreateEventInput;

    if (new Date(input.startDate) <= new Date()) {
      throw new HttpError(400, "Event start date must be in the future");
    }

    const event = await eventRepository.createEvent(input);

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input = req.body as UpdateEventInput;
    const eventId = req.params.eventId!;
    if(typeof eventId !== 'string') {
        throw new HttpError(400, "Invalid event ID");
    }
    const existingEvent = await eventRepository.getEventById(
      eventId,
    );

    if (!existingEvent) {
      throw new HttpError(404, "Event not found");
    }

    const startDate = input.startDate ?? existingEvent.startDate;
    const endDate = input.endDate ?? existingEvent.endDate;

    if (new Date(endDate) <= new Date(startDate)) {
      throw new HttpError(400, "End date must be later than start date");
    }

    if (
      input.capacity !== undefined &&
      input.capacity < existingEvent.bookedSeats
    ) {
      throw new HttpError(
        400,
        "Capacity cannot be lower than already booked seats",
      );
    }

    const event = await eventRepository.updateEvent(
      existingEvent.id,
      input,
    );

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const eventId = req.params.eventId;
    if(typeof eventId !== 'string') {
        throw new HttpError(400, "Invalid event ID");
    }

    const event = await eventRepository.getEventById(
      eventId
    );

    if (!event) {
      throw new HttpError(404, "Event not found");
    }

    if (event.bookedSeats > 0) {
      throw new HttpError(
        409,
        "Event cannot be deleted while seats are booked",
      );
    }

    await eventRepository.deleteEvent(event.id);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
