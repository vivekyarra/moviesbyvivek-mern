import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";
import MovieGrid from "../movies/MovieGrid";
import { useLocation } from "../context/LocationContext";
import {
  filterMoviesByLocation,
  searchMovies,
  searchTheatres,
} from "../../utils/movieFilters";

const MOVIES_PER_PAGE = 15;

export default function MoviesSection({ searchQuery = "" }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { location } = useLocation();
  const { movies, theatres, loading } = useCatalog() || {
    movies: [],
    theatres: [],
    loading: false,
  };

  const locationMovies = useMemo(
    () => filterMoviesByLocation(movies || [], location),
    [location, movies]
  );

  const movieMatches = useMemo(
    () => searchMovies(locationMovies, searchQuery),
    [locationMovies, searchQuery]
  );

  const theatreMatches = useMemo(
    () => searchTheatres(theatres || [], searchQuery),
    [searchQuery, theatres]
  );

  const filteredMovies = useMemo(() => {
    if (!searchQuery) return locationMovies;
    if (movieMatches.length > 0) return movieMatches;
    if (theatreMatches.length > 0) return locationMovies;
    return [];
  }, [locationMovies, movieMatches, theatreMatches, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, location?.state, location?.city]);

  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  const paginatedMovies = filteredMovies.slice(
    startIndex,
    startIndex + MOVIES_PER_PAGE
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredMovies.length / MOVIES_PER_PAGE)
  );
  const isFirstPage = page === 1;
  const isLastPage = startIndex + MOVIES_PER_PAGE >= filteredMovies.length;

  return (
    <section className="flex-1 relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xs font-semibold tracking-widest text-[var(--text-muted)]">
            MOVIES
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            {location?.state
              ? `Showing in ${location.state}`
              : "Showing across India"}
            {searchQuery && movieMatches.length > 0
              ? ` • Results for "${searchQuery}"`
              : ""}
            {searchQuery &&
            movieMatches.length === 0 &&
            theatreMatches.length > 0
              ? ` • Theatres matching "${searchQuery}"`
              : ""}
          </p>
        </div>
        <span className="text-xs text-[var(--text-muted)]">
          {filteredMovies.length} titles
        </span>
      </div>

      {loading ? (
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 text-[var(--text-muted)]">
          Loading movies...
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 text-[var(--text-muted)]">
          No movies found. Try another search or change location.
        </div>
      ) : (
      <MovieGrid
        movies={paginatedMovies}
        onSelectMovie={(movie) => navigate(`/movie/${movie.slug}`)}
      />
      )}

      {filteredMovies.length > 0 && (
        <div className="flex items-center justify-center gap-6 mt-12">
          <button
            disabled={isFirstPage}
            onClick={() => setPage((p) => p - 1)}
            className={`px-4 py-2 rounded-md text-sm font-semibold ${
              isFirstPage
                ? "bg-[var(--surface-alt)] text-[var(--text-muted)] cursor-not-allowed"
                : "bg-[var(--surface-alt)] hover:opacity-90 text-[var(--text-main)]"
            }`}
          >
            {"\u2190"} Previous
          </button>

          <span className="text-sm text-[var(--text-muted)]">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={isLastPage}
            onClick={() => setPage((p) => p + 1)}
            className={`px-4 py-2 rounded-md text-sm font-semibold ${
              isLastPage
                ? "bg-[var(--surface-alt)] text-[var(--text-muted)] cursor-not-allowed"
                : "bg-[var(--surface-alt)] hover:opacity-90 text-[var(--text-main)]"
            }`}
          >
            Next {"\u2192"}
          </button>
        </div>
      )}
    </section>
  );
}
