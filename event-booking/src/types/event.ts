
export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  city: string;
  startDate: string;
  endDate: string;
  price: number;
  capacity: number;
  bookedSeats: number;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export type EventStatus = "draft" | "published" | "cancelled";

export interface CreateEventInput {
  title: string;
  description: string;
  category: string;
  venue: string;
  city: string;
  startDate: string;
  endDate: string;
  price: number;
  capacity: number;
  status?: EventStatus;
}

export type UpdateEventInput = Partial<CreateEventInput>;
