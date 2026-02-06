import { useState } from "react";
import IndiaMap from "../map/IndiaMap";
import StateMap from "../map/StateMap";
import { useLocation } from "../context/LocationContext";
import AwardsList from "./AwardsList";

export default function LocationPanel({ mapRef }) {
  const [selectedState, setSelectedState] = useState(null);
  const { setLocation } = useLocation();

  return (
    <aside ref={mapRef}>
      {!selectedState ? (
        <>
          <div className="border border-[var(--border-color)] bg-[var(--surface)] rounded-lg p-4 mb-4 text-sm text-[var(--text-muted)]">
            SEE YOU AT THE MOVIES IN?
          </div>

          <div className="h-[480px] flex items-center justify-center">
            <IndiaMap
              onSelectState={(state) => {
                setSelectedState(state);
                setLocation({ city: state, state });
              }}
            />
          </div>
        </>
      ) : (
        <>
          <button
            onClick={() => setSelectedState(null)}
            className="mb-2 text-sm font-semibold text-[var(--text-muted)] flex items-center gap-2"
          >
            {"\u2190"} Back to India
          </button>

          <h2 className="mb-3 text-lg font-bold text-[var(--text-main)]">
            {selectedState}
          </h2>

          <div className="h-[480px]">
            <StateMap stateName={selectedState} />
          </div>
        </>
      )}

      <AwardsList />
    </aside>
  );
}
