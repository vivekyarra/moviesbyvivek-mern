import {
  MapPin,
  User,
  Search,
  Ticket,
  Gift,
  CreditCard,
  Palette,
  HelpCircle,
  Info,
  FileText,
  Shield,
  LogOut,
  PencilLine,
  KeyRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "./context/LocationContext.jsx";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import { useCatalog } from "./context/CatalogContext";
import {
  filterMoviesByLocation,
  getRecommendedMovies,
  getRecommendedTheatres,
  searchMovies,
  searchTheatres,
} from "../utils/movieFilters";
import "./Navbar.css";

export default function Navbar({
  onLocationClick,
  searchQuery,
  onSearchChange,
}) {
  const { location } = useLocation();
  const { movies, theatres } = useCatalog() || { movies: [], theatres: [] };
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const firstName = user?.name?.trim().split(" ")[0] || "User";
  const isControlled = typeof onSearchChange === "function";
  const query = isControlled ? searchQuery || "" : localQuery;
  const setQuery = (value) => {
    if (isControlled) {
      onSearchChange(value);
    } else {
      setLocalQuery(value);
    }
  };

  const availableMovies = useMemo(
    () => filterMoviesByLocation(movies || [], location),
    [location, movies]
  );

  const recommendedMovies = useMemo(
    () => getRecommendedMovies(availableMovies, 6),
    [availableMovies]
  );

  const matchedMovies = useMemo(() => {
    if (!query) return recommendedMovies;
    return searchMovies(availableMovies, query).slice(0, 8);
  }, [availableMovies, query, recommendedMovies]);

  const recommendedTheatres = useMemo(
    () => getRecommendedTheatres(theatres || [], 6),
    [theatres]
  );

  const matchedTheatres = useMemo(() => {
    if (!query) return recommendedTheatres;
    return searchTheatres(theatres || [], query).slice(0, 8);
  }, [query, recommendedTheatres, theatres]);

  const handleSearchChange = (event) => {
    setQuery(event.target.value);
    setSearchOpen(true);
  };

  const handleSelectMovie = (movie) => {
    navigate(`/movie/${movie.slug}`);
    setSearchOpen(false);
    setQuery("");
  };

  const handleSelectTheatre = (theatre) => {
    setQuery(theatre.name);
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--navbar-bg)] border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          {/* BRAND */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="brand text-left"
          >
            <div className="brand-title">movies</div>
            <div className="brand-subtitle">by vivek</div>
          </button>

          <div className="h-6 w-px bg-[var(--border-color)]" />

          {/* LOCATION */}
          <button
            onClick={onLocationClick}
            className="flex items-start gap-2 text-left"
          >
            <MapPin size={18} className="text-[var(--accent)] mt-1" />

            {!location ? (
              <span className="text-sm text-[var(--text-muted)]">
                Select Location
              </span>
            ) : (
              <div className="leading-tight max-w-[140px]">
                <div className="text-sm font-semibold truncate text-[var(--text-main)]">
                  {location.city}
                </div>
                <div className="text-xs text-[var(--text-muted)] truncate">
                  {location.state}
                </div>
              </div>
            )}
          </button>
        </div>

        {/* CENTER SEARCH */}
        <div className="relative w-[420px]" ref={searchRef}>
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            value={query}
            onChange={handleSearchChange}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setSearchOpen(false);
              }
              if (event.key === "Enter") {
                if (!query.trim()) return;
                const firstResult = searchMovies(availableMovies, query)[0];
                if (firstResult) {
                  event.preventDefault();
                  handleSelectMovie(firstResult);
                }
              }
            }}
            className="w-full bg-[var(--surface-alt)] border border-[var(--border-color)] rounded-md pl-9 pr-4 py-2 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            placeholder="Search movies or theatres"
          />

          {searchOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-[var(--surface)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-2 text-xs uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-color)]">
                {query
                  ? `Results${location?.state ? ` in ${location.state}` : ""}`
                  : `Recommended${location?.state ? ` in ${location.state}` : ""}`}
              </div>

              {matchedMovies.length === 0 && matchedTheatres.length === 0 ? (
                <div className="px-4 py-4 text-sm text-[var(--text-muted)]">
                  No matches found. Try another search.
                </div>
              ) : (
                <div className="max-h-80 overflow-auto">
                  {matchedMovies.length > 0 && (
                    <div>
                      <div className="px-4 pt-3 pb-2 text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                        Movies
                      </div>
                      {matchedMovies.map((movie) => (
                        <button
                          key={movie._id || movie.slug}
                          onClick={() => handleSelectMovie(movie)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--surface-alt)] transition"
                        >
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            className="w-10 h-14 rounded-md object-cover border border-[var(--border-color)]"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[var(--text-main)]">
                              {movie.title}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {movie.genre} {"\u2022"} {movie.language}
                            </p>
                          </div>
                          <span className="text-xs text-[var(--text-muted)]">
                            {movie.duration}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchedTheatres.length > 0 && (
                    <div className="border-t border-[var(--border-color)]">
                      <div className="px-4 pt-3 pb-2 text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                        Theatres
                      </div>
                      {matchedTheatres.map((theatre) => (
                        <button
                          key={theatre._id || theatre.name}
                          onClick={() => handleSelectTheatre(theatre)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--surface-alt)] transition"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[var(--text-main)]">
                              {theatre.name}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {theatre.area} {"\u2022"} {theatre.distance}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PROFILE */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => {
              if (!user) {
                navigate("/login");
                return;
              }
              setOpen(!open);
            }}
            className="w-9 h-9 rounded-full bg-[var(--surface-alt)] border border-[var(--border-color)] flex items-center justify-center"
          >
            {user ? (
              <span className="text-sm font-semibold text-[var(--text-main)]">
                {(user.name || "U").trim().charAt(0).toUpperCase()}
              </span>
            ) : (
              <User size={18} className="text-[var(--text-muted)]" />
            )}
          </button>

          {user && open && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-80px)]">
              <div className="px-4 py-4 flex items-center justify-between border-b border-[var(--border-color)]">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">
                    Hey!
                  </p>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/profile");
                    }}
                    className="mt-1 flex items-center gap-2 text-sm font-semibold text-[var(--text-main)] hover:text-[var(--accent)] transition"
                  >
                    Edit Profile <PencilLine size={14} />
                  </button>
                </div>
                <div className="w-12 h-12 rounded-full bg-[var(--surface-alt)] border border-[var(--border-color)] flex items-center justify-center text-sm font-semibold text-[var(--text-main)]">
                  {firstName.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-2">
                {[
                  {
                    icon: Ticket,
                    label: "Movie Bookings",
                    description: "View all your bookings",
                    to: "/bookings",
                  },
                  {
                    icon: Gift,
                    label: "Collected Vouchers",
                    description: "Check your rewards",
                    to: "/vouchers",
                  },
                  {
                    icon: CreditCard,
                    label: "Stored Payments",
                    description: "Saved cards and UPI",
                    to: "/payments",
                  },
                  {
                    icon: KeyRound,
                    label: "Reset Password",
                    description: "Change your password",
                    to: "/forgot-password",
                  },
                  {
                    icon: Palette,
                    label: "Appearance",
                    description: "Dark or light theme",
                    to: "/appearance",
                    badge: theme === "dark" ? "Dark" : "Light",
                  },
                  {
                    icon: HelpCircle,
                    label: "FAQ",
                    description: "Frequently asked questions",
                    to: "/faq",
                  },
                  {
                    icon: Info,
                    label: "About Us",
                    description: "Who we are",
                    to: "/about",
                  },
                  {
                    icon: FileText,
                    label: "Terms & Conditions",
                    description: "Know our policies",
                    to: "/terms",
                  },
                  {
                    icon: Shield,
                    label: "Privacy Policy",
                    description: "How we use data",
                    to: "/privacy",
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setOpen(false);
                      navigate(item.to);
                    }}
                    className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-[var(--surface-alt)] transition"
                  >
                    <span className="mt-1 text-[var(--text-muted)]">
                      <item.icon size={18} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-[var(--text-main)]">
                        {item.label}
                      </span>
                      <span className="block text-xs text-[var(--text-muted)]">
                        {item.description}
                      </span>
                    </span>
                    {item.badge && (
                      <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-[var(--surface-alt)] text-[var(--text-muted)] border border-[var(--border-color)]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="px-4 py-3 border-t border-[var(--border-color)]">
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-500/60 text-red-400 hover:bg-red-500/10 py-2 text-sm font-semibold transition"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
