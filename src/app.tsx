/**
 * Copyright 2024 Google LLC
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    https://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

import React, {useEffect, useState, useRef, useCallback} from 'react';
import {createRoot} from 'react-dom/client';


import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
  MapCameraChangedEvent,
  Pin
} from '@vis.gl/react-google-maps';

import {MarkerClusterer} from '@googlemaps/markerclusterer';
import type {Marker} from '@googlemaps/markerclusterer';
import locationData from './assets/locations.json';

import {Circle} from './components/circle'

type Poi = { 
  key: string, 
  location: google.maps.LatLngLiteral,
  name: string,
  type: 'retail' | 'on-site'
}

const locations: Poi[] = locationData.locations.map(loc => ({
  key: loc.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
  location: {
    lat: loc.coordinates.lat,
    lng: loc.coordinates.lng
  },
  name: loc.name,
  type: loc.type as 'retail' | 'on-site'
}));

const App = () => (
  <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} onLoad={() => console.log('Maps API has loaded.')}>
    <Map
      defaultZoom={11}
      defaultCenter={{ lat: 40.7128, lng: -74.0060 }} // Centered on NYC
      onCameraChanged={ (ev: MapCameraChangedEvent) =>
        console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
      }
      mapId='da37f3254c6a6d1c'
      >
    <PoiMarkers pois={locations} />
    </Map>
  </APIProvider>
);

const PoiMarkers = (props: { pois: Poi[] }) => {
  const map = useMap();
  const [markers, setMarkers] = useState<{[key: string]: Marker}>({});
  const clusterer = useRef<MarkerClusterer | null>(null);
  const [circleCenter, setCircleCenter] = useState(null)
  const handleClick = useCallback((ev: google.maps.MapMouseEvent) => {
    if(!map) return;
    if(!ev.latLng) return;
    console.log('marker clicked: ', ev.latLng.toString());
    map.panTo(ev.latLng);
    setCircleCenter(ev.latLng);
  });
  // Initialize MarkerClusterer, if the map has changed
  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({map});
    }
  }, [map]);

  // Update markers, if the markers array has changed
  useEffect(() => {
    clusterer.current?.clearMarkers();
    clusterer.current?.addMarkers(Object.values(markers));
  }, [markers]);

  const setMarkerRef = (marker: Marker | null, key: string) => {
    if (marker && markers[key]) return;
    if (!marker && !markers[key]) return;

    setMarkers(prev => {
      if (marker) {
        return {...prev, [key]: marker};
      } else {
        const newMarkers = {...prev};
        delete newMarkers[key];
        return newMarkers;
      }
    });
  };

  return (
    <>
      <Circle
          radius={800}
          center={circleCenter}
          strokeColor='transparent'
          strokeOpacity={1}
          strokeWeight={3}
          fillColor='transparent'
          fillOpacity={0.3}
        />
      {props.pois.map( (poi: Poi) => (
        <AdvancedMarker
          key={poi.key}
          position={poi.location}
          ref={marker => setMarkerRef(marker, poi.key)}
          clickable={true}
          onClick={handleClick}
          >
            <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
        </AdvancedMarker>
      ))}
    </>
  );
};

export default App;

const root = createRoot(document.getElementById('app'));
root.render(
      <App />
  );

