import { apiRequest } from "./api";

export function getBookings() {
  return apiRequest("/bookings");
}

export function createBooking(payload) {
  return apiRequest("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
