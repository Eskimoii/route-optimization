import { useState } from "react";
import Map from "./map";
import LocationInput from "./LocationInput";

function App() {
  const [source, setSource] = useState("");
  const [sourceLocation, setSourceLocation] = useState(null);
  const [destination, setDestination] = useState("");
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [stops, setStops] = useState([]);
  const [stopLocations, setStopLocations] = useState([]);
  const [result, setResult] = useState(null);

  // Add a new empty stop
  const addStop = () => {
  setStops([...stops, ""]);
  setStopLocations([...stopLocations, null]);
  };

  // Update a particular stop
  const updateStop = (index, value) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
  };
  const updateStopLocation = (index, location) => {
    const newLocations = [...stopLocations];
    newLocations[index] = location;
    setStopLocations(newLocations);
  };

  const removeStop = (index) => {
    const newStops = stops.filter((_, i) => i !== index);
    const newLocations = stopLocations.filter((_, i) => i !== index);

    setStops(newStops);
    setStopLocations(newLocations);
  };

  const findRoute = async () => {

    console.log("Source:", source);
    console.log("Stops:", stops);
    console.log("Destination:", destination);

    try {

        const response = await fetch(
            "http://localhost:8080/route",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    source,
                    destination
                })
            }
        );

        const data = await response.json();

        console.log("Route result:", data);

        if (!response.ok) {
            console.error(data.error);
            return;
        }

        setResult(data);

    } catch (error) {

        console.error("Route request failed:", error);
    }
};

  return (
    <div>
      <h1>Route Optimization System</h1>

      {/* Source */}
      <div>
        <label>From: </label>
        <LocationInput
          value={source}
          onChange={setSource}
          onSelect={setSourceLocation}
          placeholder="Enter starting location"
        />
      </div>

      <br />

      {/* Stops */}
      {stops.map((stop, index) => (
        <div key={index}>
          <label>Stop {index + 1}: </label>

      <LocationInput
        value={stop}
        onChange={(value) => updateStop(index, value)}
        onSelect={(location) =>
          updateStopLocation(index, location)
        }
        placeholder="Enter stop"
      />


          <button onClick={() => removeStop(index)}>
            Remove
          </button>

          <br />
          <br />
        </div>
      ))}

      {/* Add stop */}
      <button onClick={addStop}>
        + Add Stop
      </button>

      <br />
      <br />

      {/* Destination */}
      <div>
        <label>To: </label>
        <LocationInput
          value={destination}
          onChange={setDestination}
          onSelect={setDestinationLocation}
          placeholder="Enter destination"
        />
      </div>

      <br />

      <button onClick={findRoute}>
        Find Best Route
      </button>

      <br />
      <br />

      <Map
          path={result?.path}
          source={result?.source}
          destination={result?.destination}
        />

      {result && (
        <div>
          <h2>Result</h2>

          <p>
            Distance: {result.distance}
          </p>

          <p>
            Status: {result.found ? "Route found" : "No route found"}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;