import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Trip } from '../services/trip.service';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface MapComponentProps {
  trips: Trip[];
  onMarkerClick?: (trip: Trip) => void;
}

// Component to set map view to Russia
const SetMapView: React.FC<{ trips: Trip[] }> = ({ trips }) => {
  const map = useMap();
  
  useEffect(() => {
    if (trips.length > 0) {
      // If we have trips with coordinates, fit bounds to show all markers
      const markersWithCoords = trips.filter(t => t.latitude && t.longitude);
      if (markersWithCoords.length > 0) {
        const bounds = L.latLngBounds(
          markersWithCoords.map(trip => [trip.latitude!, trip.longitude!])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      } else {
        // Default view: center on Russia
        map.setView([61.5240, 105.3188], 3);
      }
    } else {
      // Default view: center on Russia
      map.setView([61.5240, 105.3188], 3);
    }
  }, [trips, map]);

  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ trips, onMarkerClick }) => {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Generate color based on user ID
  const getColorForUser = (userId: string) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    const hash = userId.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  };

  const handleMarkerClick = (trip: Trip) => {
    setSelectedTrip(trip);
    if (onMarkerClick) {
      onMarkerClick(trip);
    }
  };

  // Russian cities coordinates for mapping (simplified)
  const russianCities: Record<string, [number, number]> = {
    'Москва': [55.7558, 37.6173],
    'Санкт-Петербург': [59.9343, 30.3351],
    'Новосибирск': [55.0084, 82.9357],
    'Екатеринбург': [56.8389, 60.6057],
    'Казань': [55.7964, 49.1089],
    'Нижний Новгород': [56.3269, 44.0076],
    'Челябинск': [55.1644, 61.4368],
    'Самара': [53.1959, 50.1002],
    'Омск': [54.9914, 73.3686],
    'Ростов-на-Дону': [47.2225, 39.7188],
  };

  return (
    <div style={{ height: '600px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        center={[61.5240, 105.3188]}
        zoom={3}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <SetMapView trips={trips} />
        
        {trips.map((trip) => {
          let coordinates: [number, number] | null = null;
          
          if (trip.latitude && trip.longitude) {
            coordinates = [trip.latitude, trip.longitude];
          } else if (russianCities[trip.city]) {
            coordinates = russianCities[trip.city];
          }
          
          if (!coordinates) return null;
          
          const color = getColorForUser(trip.userId);
          const customIcon = L.divIcon({
            html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
            className: 'custom-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
          
          return (
            <Marker
              key={trip.id}
              position={coordinates}
              icon={customIcon}
              eventHandlers={{
                click: () => handleMarkerClick(trip),
              }}
            >
              <Popup>
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>{trip.city}</h4>
                  <p style={{ margin: '0 0 5px 0' }}>
                    <strong>Сотрудник:</strong> {trip.user.fullName}
                  </p>
                  <p style={{ margin: '0 0 5px 0' }}>
                    <strong>Дата прилёта:</strong> {new Date(trip.arrivalDate).toLocaleDateString('ru-RU')}
                  </p>
                  {trip.description && (
                    <p style={{ margin: '0 0 5px 0' }}>
                      <strong>Описание:</strong> {trip.description}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;