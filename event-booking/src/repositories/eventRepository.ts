
import { randomUUID } from "node:crypto";
import path from "node:path";

import type {
  CreateEventInput,
  Event,
  UpdateEventInput,
} from "../types/event.js";
import {
  initializeJsonFile,
  readJsonFile,
  writeJsonFile,
} from "../utils/jsonStorage.js";

const EVENTS_FILE = path.resolve("data", "events.json");

const ensureEventsFile = async (): Promise<void> => {
  await initializeJsonFile(EVENTS_FILE, []);
};

export const getAllEvents = async (): Promise<Event[]> => {
  await ensureEventsFile();
  return readJsonFile<Event>(EVENTS_FILE);
};

export const getEventById = async (
  eventId: string,
): Promise<Event | undefined> => {
  const events = await getAllEvents();
  return events.find((event) => event.id === eventId);
};

export const createEvent = async (
  input: CreateEventInput,
): Promise<Event> => {
  const events = await getAllEvents();
  const now = new Date().toISOString();

  const event: Event = {
    id: randomUUID(),
    title: input.title,
    description: input.description,
    category: input.category,
    venue: input.venue,
    city: input.city,
    startDate: input.startDate,
    endDate: input.endDate,
    price: input.price,
    capacity: input.capacity,
    bookedSeats: 0,
    status: input.status ?? "draft",
    createdAt: now,
    updatedAt: now,
  };

  await writeJsonFile(EVENTS_FILE, [...events, event]);

  return event;
};

export const updateEvent = async (
  eventId: string,
  input: UpdateEventInput,
): Promise<Event | undefined> => {
  const events = await getAllEvents();
  const index = events.findIndex((event) => event.id === eventId);

  if (index === -1) {
    return undefined;
  }

  const existingEvent = events[index];

  if (!existingEvent) {
    return undefined;
  }

  const updatedEvent: Event = {
    ...existingEvent,
    ...input,
    id: existingEvent.id,
    bookedSeats: existingEvent.bookedSeats,
    createdAt: existingEvent.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const updatedEvents = [...events];
  updatedEvents[index] = updatedEvent;

  await writeJsonFile(EVENTS_FILE, updatedEvents);

  return updatedEvent;
};

export const deleteEvent = async (
  eventId: string,
): Promise<boolean> => {
  const events = await getAllEvents();
  const filteredEvents = events.filter((event) => event.id !== eventId);

  if (filteredEvents.length === events.length) {
    return false;
  }

  await writeJsonFile(EVENTS_FILE, filteredEvents);

  return true;
};
