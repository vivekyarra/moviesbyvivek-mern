import { useEffect, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { useLocation } from "../context/LocationContext";

export default function StateMap({ stateName }) {
  const [stateFeature, setStateFeature] = useState(null);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [hoveredCity, setHoveredCity] = useState(null);
  const { setLocation } = useLocation();

  useEffect(() => {
    // load states
    fetch("/maps/india-states.geojson")
      .then((res) => res.json())
      .then((data) => {
        const match = data.features.find(
          (f) => f.properties.st_nm === stateName,
        );
        setStateFeature(match);
      });

    // load cities
    fetch("/maps/cities.json")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((c) => c.state === stateName);
        setCities(filtered);
      });
  }, [stateName]);

  useEffect(() => {
    setSelectedCity(null);
    setHoveredCity(null);
  }, [stateName]);

  if (!stateFeature) {
    return (
      <div className="text-sm text-[var(--text-muted)]">Loading map...</div>
    );
  }

  const projection = geoMercator().fitSize([1000, 1000], stateFeature);

  const path = geoPath().projection(projection);

  return (
    <svg viewBox="0 0 1000 1000" className="w-full h-full">
      {/* STATE SHAPE */}
      <path
        d={path(stateFeature)}
        fill="#d1d5db"
        stroke="#bfc5cf"
        strokeWidth={0.6}
        style={{ cursor: "pointer" }}
        onMouseEnter={(e) => (e.target.style.fill = "#b0b6bf")}
        onMouseLeave={(e) => (e.target.style.fill = "#d1d5db")}
        onClick={() => setLocation({ city: stateName, state: stateName })}
      />

      {/* CITY DOTS */}
      {cities.map((city, i) => {
        const point = projection([city.lon, city.lat]);
        if (!point) return null;

        const [x, y] = point;
        const isHovered = hoveredCity === city.name;
        const isSelected = selectedCity === city.name;
        const dotFill = isSelected ? "#06b6d4" : isHovered ? "#22d3ee" : "#111";
        const textFill = isSelected ? "#0ea5e9" : isHovered ? "#0ea5e9" : "#111";

        return (
          <g
            key={i}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setHoveredCity(city.name)}
            onMouseLeave={() => setHoveredCity(null)}
            onClick={() => {
              setSelectedCity(city.name);
              setLocation({ city: city.name, state: stateName });
            }}
          >
            <circle cx={x} cy={y} r={10} fill="transparent" />
            <circle
              cx={x}
              cy={y}
              r={5}
              fill={dotFill}
              stroke="#bfc5cf"
              strokeWidth={1}
            />
            <text
              x={x + 7}
              y={y}
              fontSize={16}
              fontWeight={isSelected ? "700" : "600"}
              fill={textFill}
              dominantBaseline="middle"
            >
              {city.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
