import { apiRequest } from "./api";

export function fetchAdminStatus() {
  return apiRequest("/admin/status");
}

export function listAdminMovies() {
  return apiRequest("/admin/movies");
}

export function createAdminMovie(payload) {
  return apiRequest("/admin/movies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminMovie(id, payload) {
  return apiRequest(`/admin/movies/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminMovie(id) {
  return apiRequest(`/admin/movies/${id}`, { method: "DELETE" });
}

export function listAdminTheatres() {
  return apiRequest("/admin/theatres");
}

export function createAdminTheatre(payload) {
  return apiRequest("/admin/theatres", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminTheatre(id, payload) {
  return apiRequest(`/admin/theatres/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminTheatre(id) {
  return apiRequest(`/admin/theatres/${id}`, { method: "DELETE" });
}

export function listAdminShowtimes(query = {}) {
  const params = new URLSearchParams();
  if (query.movieId) params.set("movieId", query.movieId);
  if (query.date) params.set("date", query.date);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return apiRequest(`/admin/showtimes${suffix}`);
}

export function createAdminShowtime(payload) {
  return apiRequest("/admin/showtimes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminShowtime(id, payload) {
  return apiRequest(`/admin/showtimes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminShowtime(id) {
  return apiRequest(`/admin/showtimes/${id}`, { method: "DELETE" });
}
