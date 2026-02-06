import { createContext, useContext, useEffect, useState } from "react";
import { getMovies, getTheatres } from "../../services/catalog.service";

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCatalog = async () => {
    setLoading(true);
    setError("");
    try {
      const [moviesData, theatresData] = await Promise.all([
        getMovies(),
        getTheatres(),
      ]);
      setMovies(Array.isArray(moviesData) ? moviesData : []);
      setTheatres(Array.isArray(theatresData) ? theatresData : []);
    } catch (err) {
      setError(err.message || "Failed to load catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  return (
    <CatalogContext.Provider
      value={{
        movies,
        theatres,
        loading,
        error,
        reload: loadCatalog,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  return useContext(CatalogContext);
}
