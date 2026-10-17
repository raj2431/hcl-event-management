
export type BookingStatus =
  | "confirmed"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export interface Booking {
  id: string;
  bookingReference: string;
  eventId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  seats: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingInput {
  eventId: string;
  customerName: string;
  customerEmail: string;
  seats: number;
}

export interface CancelBookingInput {
  reason?: string;
}
