import { useState } from "react";
import MovieCard from "./MovieCard";

export default function MovieGrid({ movies, onSelectMovie }) {
  const [hoveredMovieId, setHoveredMovieId] = useState(null);

  return (
    <div className="grid grid-cols-3 gap-8">
      {movies.map((movie) => {
        const movieKey = movie._id || movie.slug;
        const isHovered = hoveredMovieId === movieKey;

        return (
          <MovieCard
            key={movieKey}
            movie={movie}
            isHovered={isHovered}
            dimmed={hoveredMovieId && !isHovered}
            onHover={() => setHoveredMovieId(movieKey)}
            onBlur={() => setHoveredMovieId(null)}
            onSelect={() => onSelectMovie(movie)}
          />
        );
      })}
    </div>
  );
}
