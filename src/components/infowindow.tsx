import React from 'react';
import { InfoWindow as GoogleInfoWindow } from '@vis.gl/react-google-maps';

type InfoWindowProps = {
  position: google.maps.LatLngLiteral;
  location: {
    name: string;
    address: string;
    type: 'retail' | 'on-site';
  };
  onClose: () => void;
};

export const InfoWindow: React.FC<InfoWindowProps> = ({ position, location, onClose }) => {
  return (
    <GoogleInfoWindow position={position} onCloseClick={onClose}>
      <div style={{padding: '8px', maxWidth: '200px'}}>
        <h3 style={{margin: '0 0 8px 0'}}>{location.name}</h3>
        <p style={{margin: '0 0 4px 0'}}>{location.address}</p>
        <p style={{margin: '0', textTransform: 'capitalize'}}>
          Served: {location.type}
        </p>
      </div>
    </GoogleInfoWindow>
  );
};