// IndiaMap.jsx
import { useEffect, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";

export default function IndiaMap({ onSelectState }) {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch("/maps/india-states.geojson")
      .then((res) => res.json())
      .then(setGeoData)
      .catch(console.error);
  }, []);

  if (!geoData)
    return (
      <div className="text-sm text-[var(--text-muted)]">Loading map…</div>
    );

  const projection = geoMercator()
    .center([81, 23])
    .scale(1777)
    .translate([500, 520]);

  const path = geoPath().projection(projection);

  return (
    <svg viewBox="0 0 1000 1000" className="w-full h-full">
      {geoData.features.map((feature, i) => {
        const stateName = feature.properties.st_nm;

        return (
          <path
            key={i}
            d={path(feature)}
            fill="#d1d5db"
            stroke="#bfc5cf"
            strokeWidth={0.6}
            style={{ cursor: "pointer" }}
            onMouseEnter={(e) => (e.target.style.fill = "#81797a")}
            onMouseLeave={(e) => (e.target.style.fill = "#d1d5db")}
            onClick={() => onSelectState(stateName)}
          />
        );
      })}
    </svg>
  );
}
