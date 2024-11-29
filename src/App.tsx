// App.tsx
import { useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import './App.css';

// Sample location data
const locations = [
  { id: 1, name: "Central Park", lat: 40.7829, lng: -73.9654, description: "Urban park in New York City" },
  { id: 2, name: "Statue of Liberty", lat: 40.6892, lng: -74.0445, description: "Famous NYC landmark" },
  { id: 3, name: "Times Square", lat: 40.7580, lng: -73.9855, description: "Major commercial intersection" }
];

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const waypointIcon = {
  // Simple icon definition that doesn't rely on google.maps
  url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
  scaledSize: {
    width: 32,
    height: 32
  }
};

function App() {
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  const handleMarkerMouseOver = (locationId: number) => {
    setActiveTooltip(locationId);
  };

  const handleMarkerMouseOut = () => {
    setActiveTooltip(null);
  };

  return (
    <div className="app-container">
      <div className="locations-sidebar">
        <h2>Locations</h2>
        <div className="location-list">
          {locations.map(location => (
            <div
              key={location.id}
              className={`location-item ${selectedLocation.id === location.id ? 'active' : ''}`}
              onClick={() => setSelectedLocation(location)}
            >
              <h3>{location.name}</h3>
              <p>{location.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="map-container">
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            zoom={13}
          >
            {locations.map(location => (
              <div key={location.id}>
                <Marker
                  position={{ lat: location.lat, lng: location.lng }}
                  icon={waypointIcon.url}
                  onMouseOver={() => handleMarkerMouseOver(location.id)}
                  onMouseOut={handleMarkerMouseOut}
                  onClick={() => handleMarkerMouseOver(location.id)}
                />
                {activeTooltip === location.id && (
                  <InfoWindow
                    position={{ lat: location.lat, lng: location.lng }}
                    onCloseClick={() => setActiveTooltip(null)}
                  >
                    <div className="tooltip-content">
                      <h4>{location.name}</h4>
                      <p>{location.description}</p>
                    </div>
                  </InfoWindow>
                )}
              </div>
            ))}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}

export default App;