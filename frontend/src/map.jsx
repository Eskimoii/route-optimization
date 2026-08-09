import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import graph from "./graph";

function FitRoute({ path }) {
  const map = useMap();

  if (path && path.length > 1) {
    const bounds = path.map(([lat, lng]) => [lat, lng]);

    map.fitBounds(bounds, {
      padding: [40, 40]
    });
  }

  return null;
}

function Map({ path, source, destination }) {
  console.log("Number of nodes:", Object.keys(graph.nodes).length);
  console.log("Route path:", path);

  return (
    <MapContainer
      center={[25.3176, 82.9839]}
      zoom={14}
      style={{
        height: "500px",
        width: "100%"
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {path && path.length > 1 && (
        <Polyline
          positions={path}
          pathOptions={{
            color: "red",
            weight: 6
          }}
        />
      )}

      {source && (
        <Marker position={[source.lat, source.lng]}>
          <Popup>
            <b>Source</b>
          </Popup>
        </Marker>
      )}

      {destination && (
        <Marker position={[destination.lat, destination.lng]}>
          <Popup>
            <b>Destination</b>
          </Popup>
        </Marker>
      )}

      <FitRoute path={path} />
    </MapContainer>
  );
}

export default Map;