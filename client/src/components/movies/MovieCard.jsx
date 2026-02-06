export default function MovieCard({
  movie,
  isHovered,
  dimmed,
  onHover,
  onBlur,
  onSelect,
}) {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onBlur}
      onClick={onSelect}
      className={`
        bg-[var(--surface)] rounded-xl overflow-hidden cursor-pointer border border-[var(--border-color)]
        transition-all duration-300
        ${dimmed ? "opacity-40 scale-95" : ""}
        ${isHovered ? "scale-105 z-20 shadow-2xl" : ""}
      `}
    >
      <img
        src={movie.poster}
        alt={movie.title}
        className="w-full h-[320px] object-cover"
      />

      <div className="p-4">
        <h4 className="text-[var(--text-main)] font-semibold text-base">
          {movie.title}
        </h4>

        <p className="text-sm text-[var(--text-muted)] mt-1">
          {movie.genre} {"\u2022"} {movie.language}
        </p>

        <button className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-sm font-semibold">
          Book Tickets
        </button>
      </div>
    </div>
  );
}
