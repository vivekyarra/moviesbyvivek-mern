import { apiRequest } from "./api";

export function getMovies() {
  return apiRequest("/movies");
}

export function getMovie(slug) {
  return apiRequest(`/movies/${slug}`);
}

export function getTheatres() {
  return apiRequest("/theatres");
}
