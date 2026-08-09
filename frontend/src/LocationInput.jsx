import { useState } from "react";

function LocationInput({ value, onChange, onSelect, placeholder }) {
  const [suggestions, setSuggestions] = useState([]);

  const searchLocation = async (text) => {
    onChange(text);

    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/geocode?query=${encodeURIComponent(text)}`
      );

      const data = await response.json();

      setSuggestions(data);
    } catch (error) {
      console.error("Geocoding error:", error);
      setSuggestions([]);
    }
  };

  const selectLocation = (location) => {
    onChange(location.name);
    onSelect(location);
    setSuggestions([]);
  };

  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => searchLocation(e.target.value)}
        placeholder={placeholder}
      />

      {suggestions.length > 0 && (
        <div>
          {suggestions.map((location, index) => (
            <div
              key={index}
              onClick={() => selectLocation(location)}
              style={{
                padding: "8px",
                cursor: "pointer",
                border: "1px solid #ddd"
              }}
            >
              {location.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LocationInput;