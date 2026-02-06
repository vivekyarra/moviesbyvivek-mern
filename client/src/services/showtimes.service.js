import { apiRequest } from "./api";

export function getShowtimes({ movieId, date }) {
  const params = new URLSearchParams({ movieId, date });
  return apiRequest(`/showtimes?${params.toString()}`);
}

export function getShowtime(id) {
  return apiRequest(`/showtimes/${id}`);
}

export function getOccupiedSeats(showtimeId) {
  return apiRequest(`/showtimes/${showtimeId}/occupied`);
}
