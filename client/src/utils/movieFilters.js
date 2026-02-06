const stateLanguageMap = {
  "andhra pradesh": ["Telugu", "English", "Hindi"],
  "telangana": ["Telugu", "English", "Hindi"],
  "tamil nadu": ["Tamil", "English", "Hindi"],
  "karnataka": ["Kannada", "English", "Hindi"],
  "kerala": ["English", "Hindi", "Tamil"],
  "maharashtra": ["Hindi", "English"],
  "gujarat": ["Hindi", "English"],
  "madhya pradesh": ["Hindi", "English"],
  "uttar pradesh": ["Hindi", "English"],
  "rajasthan": ["Hindi", "English"],
  "delhi": ["Hindi", "English"],
  "new delhi": ["Hindi", "English"],
  "bihar": ["Hindi", "English"],
  "jharkhand": ["Hindi", "English"],
  "chhattisgarh": ["Hindi", "English"],
  "west bengal": ["Hindi", "English"],
  "odisha": ["Hindi", "English"],
  "assam": ["Hindi", "English"],
  "punjab": ["Hindi", "English"],
  "haryana": ["Hindi", "English"],
  "uttarakhand": ["Hindi", "English"],
  "himachal pradesh": ["Hindi", "English"],
  "goa": ["Hindi", "English"],
  "puducherry": ["Tamil", "English"],
  "jammu and kashmir": ["Hindi", "English"],
  "jammu & kashmir": ["Hindi", "English"],
  "andaman and nicobar islands": ["Hindi", "English"],
  "andaman & nicobar islands": ["Hindi", "English"],
};

function normalizeState(stateName) {
  if (!stateName) return "";
  return stateName
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, " ")
    .trim();
}

export function getLanguagesForLocation(location) {
  if (!location?.state) return null;
  const key = normalizeState(location.state);
  return stateLanguageMap[key] || null;
}

export function filterMoviesByLocation(movies, location) {
  const languages = getLanguagesForLocation(location);
  if (!languages) return movies;
  return movies.filter((movie) => languages.includes(movie.language));
}

export function searchMovies(movies, query) {
  if (!query) return movies;
  const q = query.trim().toLowerCase();
  if (!q) return movies;
  return movies.filter((movie) => {
    const title = (movie.title || "").toLowerCase();
    const genre = (movie.genre || "").toLowerCase();
    const language = (movie.language || "").toLowerCase();
    const slug = (movie.slug || "").toLowerCase();
    const id = (movie.id || "").toLowerCase();
    return (
      title.includes(q) ||
      genre.includes(q) ||
      language.includes(q) ||
      slug.includes(q) ||
      id.includes(q)
    );
  });
}

export function getRecommendedMovies(movies, limit = 6) {
  return movies.slice(0, limit);
}

export function searchTheatres(theatres, query) {
  if (!query) return theatres;
  const q = query.trim().toLowerCase();
  if (!q) return theatres;
  return theatres.filter((theatre) => {
    const name = (theatre.name || "").toLowerCase();
    const area = (theatre.area || "").toLowerCase();
    const id = (theatre._id || theatre.id || "").toLowerCase();
    return (
      name.includes(q) ||
      area.includes(q) ||
      id.includes(q)
    );
  });
}

export function getRecommendedTheatres(theatres, limit = 6) {
  return theatres.slice(0, limit);
}
