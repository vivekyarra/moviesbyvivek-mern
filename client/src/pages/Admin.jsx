import { useEffect, useMemo, useState } from "react";
import PageShell from "../components/common/PageShell";
import {
  fetchAdminStatus,
  listAdminMovies,
  createAdminMovie,
  updateAdminMovie,
  deleteAdminMovie,
  listAdminTheatres,
  createAdminTheatre,
  updateAdminTheatre,
  deleteAdminTheatre,
  listAdminShowtimes,
  createAdminShowtime,
  updateAdminShowtime,
  deleteAdminShowtime,
} from "../services/admin.service";

const emptyMovie = {
  slug: "",
  title: "",
  genre: "",
  language: "",
  poster: "",
  duration: "",
  certificate: "U/A",
  description: "",
};

const emptyTheatre = {
  name: "",
  area: "",
  distance: "",
  city: "",
  state: "",
  shows: "",
};

const todayIso = new Date().toISOString().slice(0, 10);

const emptyShowtime = {
  movieId: "",
  theatreId: "",
  date: todayIso,
  time: "",
};

const parseShows = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function Admin() {
  const [adminState, setAdminState] = useState({
    status: "loading",
    error: "",
  });
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [showtimes, setShowtimes] = useState([]);

  const [movieForm, setMovieForm] = useState(emptyMovie);
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [movieStatus, setMovieStatus] = useState("idle");
  const [movieError, setMovieError] = useState("");

  const [theatreForm, setTheatreForm] = useState(emptyTheatre);
  const [editingTheatreId, setEditingTheatreId] = useState(null);
  const [theatreStatus, setTheatreStatus] = useState("idle");
  const [theatreError, setTheatreError] = useState("");

  const [showtimeForm, setShowtimeForm] = useState(emptyShowtime);
  const [editingShowtimeId, setEditingShowtimeId] = useState(null);
  const [showtimeStatus, setShowtimeStatus] = useState("idle");
  const [showtimeError, setShowtimeError] = useState("");

  const [showtimeFilters, setShowtimeFilters] = useState({
    date: todayIso,
    movieId: "",
    theatreId: "",
  });

  useEffect(() => {
    fetchAdminStatus()
      .then(() => {
        setAdminState({ status: "ready", error: "" });
      })
      .catch((err) => {
        setAdminState({
          status: "error",
          error: err.message || "Admin access required.",
        });
      });
  }, []);

  useEffect(() => {
    if (adminState.status !== "ready") return;
    Promise.all([listAdminMovies(), listAdminTheatres()])
      .then(([movieData, theatreData]) => {
        setMovies(movieData);
        setTheatres(theatreData);
      })
      .catch((err) => {
        setAdminState({
          status: "error",
          error: err.message || "Failed to load admin data.",
        });
      });
  }, [adminState.status]);

  const loadShowtimes = async () => {
    setShowtimeStatus("loading");
    setShowtimeError("");
    try {
      const data = await listAdminShowtimes({
        date: showtimeFilters.date,
        movieId: showtimeFilters.movieId || undefined,
      });
      const enriched = data.map(enrichShowtime);
      const filtered = showtimeFilters.theatreId
        ? enriched.filter(
            (item) =>
              item.theatre?._id === showtimeFilters.theatreId ||
              item.theatre?.id === showtimeFilters.theatreId ||
              item.theatre === showtimeFilters.theatreId
          )
        : enriched;
      setShowtimes(filtered);
      setShowtimeStatus("idle");
    } catch (err) {
      setShowtimeError(err.message || "Failed to load showtimes.");
      setShowtimeStatus("error");
    }
  };

  const sortedMovies = useMemo(
    () => [...movies].sort((a, b) => a.title.localeCompare(b.title)),
    [movies]
  );

  const sortedTheatres = useMemo(
    () => [...theatres].sort((a, b) => a.name.localeCompare(b.name)),
    [theatres]
  );

  const enrichShowtime = (showtime) => {
    const movieValue =
      typeof showtime.movie === "object"
        ? showtime.movie
        : movies.find((movie) => movie._id === showtime.movie) || showtime.movie;
    const theatreValue =
      typeof showtime.theatre === "object"
        ? showtime.theatre
        : theatres.find((theatre) => theatre._id === showtime.theatre) ||
          showtime.theatre;
    return { ...showtime, movie: movieValue, theatre: theatreValue };
  };

  const resetMovieForm = () => {
    setMovieForm(emptyMovie);
    setEditingMovieId(null);
    setMovieStatus("idle");
    setMovieError("");
  };

  const resetTheatreForm = () => {
    setTheatreForm(emptyTheatre);
    setEditingTheatreId(null);
    setTheatreStatus("idle");
    setTheatreError("");
  };

  const resetShowtimeForm = () => {
    setShowtimeForm({ ...emptyShowtime, date: showtimeFilters.date || todayIso });
    setEditingShowtimeId(null);
    setShowtimeStatus("idle");
    setShowtimeError("");
  };

  const handleMovieSubmit = async (event) => {
    event.preventDefault();
    setMovieStatus("loading");
    setMovieError("");
    try {
      if (editingMovieId) {
        const updated = await updateAdminMovie(editingMovieId, movieForm);
        setMovies((prev) =>
          prev.map((movie) => (movie._id === updated._id ? updated : movie))
        );
        resetMovieForm();
      } else {
        const created = await createAdminMovie(movieForm);
        setMovies((prev) => [...prev, created]);
        resetMovieForm();
      }
    } catch (err) {
      setMovieError(err.message || "Failed to save movie.");
      setMovieStatus("error");
    }
  };

  const handleMovieEdit = (movie) => {
    setMovieForm({
      slug: movie.slug || "",
      title: movie.title || "",
      genre: movie.genre || "",
      language: movie.language || "",
      poster: movie.poster || "",
      duration: movie.duration || "",
      certificate: movie.certificate || "U/A",
      description: movie.description || "",
    });
    setEditingMovieId(movie._id);
    setMovieStatus("idle");
    setMovieError("");
  };

  const handleMovieDelete = async (movieId) => {
    if (!window.confirm("Delete this movie?")) return;
    try {
      await deleteAdminMovie(movieId);
      setMovies((prev) => prev.filter((movie) => movie._id !== movieId));
    } catch (err) {
      setMovieError(err.message || "Failed to delete movie.");
    }
  };

  const handleTheatreSubmit = async (event) => {
    event.preventDefault();
    setTheatreStatus("loading");
    setTheatreError("");
    try {
      const payload = {
        ...theatreForm,
        shows: parseShows(theatreForm.shows || ""),
      };

      if (editingTheatreId) {
        const updated = await updateAdminTheatre(editingTheatreId, payload);
        setTheatres((prev) =>
          prev.map((theatre) =>
            theatre._id === updated._id ? updated : theatre
          )
        );
        resetTheatreForm();
      } else {
        const created = await createAdminTheatre(payload);
        setTheatres((prev) => [...prev, created]);
        resetTheatreForm();
      }
    } catch (err) {
      setTheatreError(err.message || "Failed to save theatre.");
      setTheatreStatus("error");
    }
  };

  const handleTheatreEdit = (theatre) => {
    setTheatreForm({
      name: theatre.name || "",
      area: theatre.area || "",
      distance: theatre.distance || "",
      city: theatre.city || "",
      state: theatre.state || "",
      shows: Array.isArray(theatre.shows) ? theatre.shows.join(", ") : "",
    });
    setEditingTheatreId(theatre._id);
    setTheatreStatus("idle");
    setTheatreError("");
  };

  const handleTheatreDelete = async (theatreId) => {
    if (!window.confirm("Delete this theatre?")) return;
    try {
      await deleteAdminTheatre(theatreId);
      setTheatres((prev) => prev.filter((theatre) => theatre._id !== theatreId));
    } catch (err) {
      setTheatreError(err.message || "Failed to delete theatre.");
    }
  };

  const handleShowtimeSubmit = async (event) => {
    event.preventDefault();
    setShowtimeStatus("loading");
    setShowtimeError("");
    try {
      const payload = {
        movieId: showtimeForm.movieId,
        theatreId: showtimeForm.theatreId,
        date: showtimeForm.date,
        time: showtimeForm.time,
      };

      if (editingShowtimeId) {
        const updated = enrichShowtime(
          await updateAdminShowtime(editingShowtimeId, payload)
        );
        setShowtimes((prev) =>
          prev.map((showtime) =>
            showtime._id === updated._id ? updated : showtime
          )
        );
        resetShowtimeForm();
      } else {
        const created = enrichShowtime(await createAdminShowtime(payload));
        setShowtimes((prev) => [...prev, created]);
        resetShowtimeForm();
      }
    } catch (err) {
      setShowtimeError(err.message || "Failed to save showtime.");
      setShowtimeStatus("error");
    }
  };

  const handleShowtimeEdit = (showtime) => {
    setShowtimeForm({
      movieId: showtime.movie?._id || showtime.movie || "",
      theatreId: showtime.theatre?._id || showtime.theatre || "",
      date: showtime.date || todayIso,
      time: showtime.time || "",
    });
    setEditingShowtimeId(showtime._id);
    setShowtimeStatus("idle");
    setShowtimeError("");
  };

  const handleShowtimeDelete = async (showtimeId) => {
    if (!window.confirm("Delete this showtime?")) return;
    try {
      await deleteAdminShowtime(showtimeId);
      setShowtimes((prev) => prev.filter((showtime) => showtime._id !== showtimeId));
    } catch (err) {
      setShowtimeError(err.message || "Failed to delete showtime.");
    }
  };

  if (adminState.status === "loading") {
    return (
      <PageShell title="Admin Dashboard">
        <div className="text-sm text-[var(--text-muted)]">Checking admin access...</div>
      </PageShell>
    );
  }

  if (adminState.status === "error") {
    return (
      <PageShell title="Admin Dashboard">
        <div className="max-w-xl bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6">
          <p className="text-sm text-red-400">{adminState.error}</p>
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            Make sure your account email is listed in <code>ADMIN_EMAILS</code> on the server.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Admin Dashboard">
      <div className="space-y-10">
        <section className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Movies</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Add or update the movies shown on the home page.
              </p>
            </div>
            <button
              onClick={resetMovieForm}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] underline"
            >
              Clear form
            </button>
          </div>

          <form onSubmit={handleMovieSubmit} className="mt-6 grid md:grid-cols-2 gap-4">
            <input
              value={movieForm.title}
              onChange={(e) => setMovieForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Title"
              className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)]"
              required
            />
            <input
              value={movieForm.slug}
              onChange={(e) => setMovieForm((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="Slug (unique)"
              className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)]"
              required
            />
            <input
              value={movieForm.genre}
              onChange={(e) => setMovieForm((prev) => ({ ...prev, genre: e.target.value }))}
              placeholder="Genre"
              className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)]"
              required
            />
            <input
              value={movieForm.language}
              onChange={(e) => setMovieForm((prev) => ({ ...prev, language: e.target.value }))}
              placeholder="Language"
              className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)]"
              required
            />
            <input
              value={movieForm.duration}
              onChange={(e) => setMovieForm((prev) => ({ ...prev, duration: e.target.value }))}
              placeholder="Duration (e.g. 2h 10m)"
              className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)]"
              required
            />
            <input
              value={movieForm.certificate}
              onChange={(e) => setMovieForm((prev) => ({ ...prev, certificate: e.target.value }))}
              placeholder="Certificate (U/A)"
              className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)]"
            />
            <input
              value={movieForm.poster}
              onChange={(e) => setMovieForm((prev) => ({ ...prev, poster: e.target.value }))}
              placeholder="Poster URL"
              className="md:col-span-2 w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)]"
              required
            />
            <textarea
              value={movieForm.description}
              onChange={(e) => setMovieForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Description"
              className="md:col-span-2 w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)] min-h-[90px]"
            />

            {movieError && <p className="md:col-span-2 text-sm text-red-400">{movieError}</p>}
            <button
              type="submit"
              disabled={movieStatus === "loading"}
              className="md:col-span-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-60"
            >
              {movieStatus === "loading"
                ? "Saving..."
                : editingMovieId
                  ? "Update Movie"
                  : "Add Movie"}
            </button>
          </form>

          <div className="mt-8 space-y-3">
            {sortedMovies.map((movie) => (
              <div
                key={movie._id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-[var(--border-color)] p-4 bg-[var(--surface-alt)]"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-12 h-16 rounded-md object-cover border border-[var(--border-color)]"
                  />
                  <div>
                    <p className="font-semibold">{movie.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {movie.genre} • {movie.language} • {movie.duration}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleMovieEdit(movie)}
                    className="text-xs px-3 py-1 rounded-full border border-[var(--border-color)] hover:bg-[var(--surface)]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleMovieDelete(movie._id)}
                    className="text-xs px-3 py-1 rounded-full border border-red-500/60 text-red-400 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Theatres</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Manage theatre locations and their show timings.
              </p>
            </div>
            <button
              onClick={resetTheatreForm}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] underline"
            >
              Clear form
            </button>
          </div>

          <form onSubmit={handleTheatreSubmit} className="mt-6 grid md:grid-cols-2 gap-4">
            <input
              value={theatreForm.name}
              onChange={(e) => setTheatreForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Theatre name"
              className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)]"
              required
            />
            <input
              value={theatreForm.area}
              onChange={(e) => setTheatreForm((prev) => ({ ...prev, area: e.target.value }))}
              placeholder="Area"
              className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)]"
              required
            />
            <input
              value={theatreForm.distance}
              onChange={(e) => setTheatreForm((prev) => ({ ...prev, distance: e.target.value }))}
              placeholder="Distance (e.g. 3 km)"
              className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)]"
            />
            <input
              value={theatreForm.city}
              onChange={(e) => setTheatreForm((prev) => ({ ...prev, city: e.target.value }))}
              placeholder="City"
              className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)]"
            />
            <input
              value={theatreForm.state}
              onChange={(e) => setTheatreForm((prev) => ({ ...prev, state: e.target.value }))}
              placeholder="State"
              className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)]"
            />
            <input
              value={theatreForm.shows}
              onChange={(e) => setTheatreForm((prev) => ({ ...prev, shows: e.target.value }))}
              placeholder="Show times (comma separated)"
              className="md:col-span-2 w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)]"
            />

            {theatreError && (
              <p className="md:col-span-2 text-sm text-red-400">{theatreError}</p>
            )}
            <button
              type="submit"
              disabled={theatreStatus === "loading"}
              className="md:col-span-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-60"
            >
              {theatreStatus === "loading"
                ? "Saving..."
                : editingTheatreId
                  ? "Update Theatre"
                  : "Add Theatre"}
            </button>
          </form>

          <div className="mt-8 space-y-3">
            {sortedTheatres.map((theatre) => (
              <div
                key={theatre._id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-[var(--border-color)] p-4 bg-[var(--surface-alt)]"
              >
                <div>
                  <p className="font-semibold">{theatre.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {theatre.area}
                    {theatre.city ? `, ${theatre.city}` : ""}
                    {theatre.state ? `, ${theatre.state}` : ""}
                    {theatre.distance ? ` • ${theatre.distance}` : ""}
                  </p>
                  {Array.isArray(theatre.shows) && theatre.shows.length > 0 && (
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Shows: {theatre.shows.join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleTheatreEdit(theatre)}
                    className="text-xs px-3 py-1 rounded-full border border-[var(--border-color)] hover:bg-[var(--surface)]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleTheatreDelete(theatre._id)}
                    className="text-xs px-3 py-1 rounded-full border border-red-500/60 text-red-400 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Showtimes</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Create or edit showtimes for specific dates.
              </p>
            </div>
            <button
              onClick={resetShowtimeForm}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] underline"
            >
              Clear form
            </button>
          </div>

          <form onSubmit={handleShowtimeSubmit} className="mt-6 grid md:grid-cols-2 gap-4">
            <select
              value={showtimeForm.movieId}
              onChange={(e) =>
                setShowtimeForm((prev) => ({ ...prev, movieId: e.target.value }))
              }
              className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)]"
              required
            >
              <option value="">Select movie</option>
              {sortedMovies.map((movie) => (
                <option key={movie._id} value={movie._id}>
                  {movie.title}
                </option>
              ))}
            </select>
            <select
              value={showtimeForm.theatreId}
              onChange={(e) =>
                setShowtimeForm((prev) => ({ ...prev, theatreId: e.target.value }))
              }
              className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)]"
              required
            >
              <option value="">Select theatre</option>
              {sortedTheatres.map((theatre) => (
                <option key={theatre._id} value={theatre._id}>
                  {theatre.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={showtimeForm.date}
              onChange={(e) =>
                setShowtimeForm((prev) => ({ ...prev, date: e.target.value }))
              }
              className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)]"
              required
            />
            <input
              value={showtimeForm.time}
              onChange={(e) =>
                setShowtimeForm((prev) => ({ ...prev, time: e.target.value }))
              }
              placeholder="Time (e.g. 10:00 AM)"
              className="w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)]"
              required
            />

            {showtimeError && (
              <p className="md:col-span-2 text-sm text-red-400">{showtimeError}</p>
            )}
            <button
              type="submit"
              disabled={showtimeStatus === "loading"}
              className="md:col-span-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-60"
            >
              {showtimeStatus === "loading"
                ? "Saving..."
                : editingShowtimeId
                  ? "Update Showtime"
                  : "Add Showtime"}
            </button>
          </form>

          <div className="mt-8">
            <div className="flex flex-col md:flex-row md:items-end gap-3">
              <div>
                <label className="text-xs uppercase tracking-widest text-[var(--text-muted)]">
                  Date
                </label>
                <input
                  type="date"
                  value={showtimeFilters.date}
                  onChange={(e) =>
                    setShowtimeFilters((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="mt-2 w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)]"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[var(--text-muted)]">
                  Movie
                </label>
                <select
                  value={showtimeFilters.movieId}
                  onChange={(e) =>
                    setShowtimeFilters((prev) => ({ ...prev, movieId: e.target.value }))
                  }
                  className="mt-2 w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)]"
                >
                  <option value="">All movies</option>
                  {sortedMovies.map((movie) => (
                    <option key={movie._id} value={movie._id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[var(--text-muted)]">
                  Theatre
                </label>
                <select
                  value={showtimeFilters.theatreId}
                  onChange={(e) =>
                    setShowtimeFilters((prev) => ({
                      ...prev,
                      theatreId: e.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-md px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border-color)] text-[var(--text-main)]"
                >
                  <option value="">All theatres</option>
                  {sortedTheatres.map((theatre) => (
                    <option key={theatre._id} value={theatre._id}>
                      {theatre.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={loadShowtimes}
                className="h-10 px-4 rounded-md border border-[var(--border-color)] hover:bg-[var(--surface-alt)] text-sm"
              >
                {showtimeStatus === "loading" ? "Loading..." : "Load showtimes"}
              </button>
            </div>

            {showtimeError && (
              <p className="mt-3 text-sm text-red-400">{showtimeError}</p>
            )}

            <div className="mt-4 space-y-3">
              {showtimes.map((showtime) => (
                <div
                  key={showtime._id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-[var(--border-color)] p-4 bg-[var(--surface-alt)]"
                >
                  <div>
                    <p className="font-semibold">{showtime.movie?.title || "Movie"}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {showtime.theatre?.name || "Theatre"} • {showtime.date} • {showtime.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleShowtimeEdit(showtime)}
                      className="text-xs px-3 py-1 rounded-full border border-[var(--border-color)] hover:bg-[var(--surface)]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleShowtimeDelete(showtime._id)}
                      className="text-xs px-3 py-1 rounded-full border border-red-500/60 text-red-400 hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {showtimes.length === 0 && showtimeStatus !== "loading" && (
                <p className="text-sm text-[var(--text-muted)]">
                  No showtimes loaded yet. Use the filters above to load them.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
