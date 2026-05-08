import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0' // Handled by wrapper
};

const defaultCenter = {
  lat: 48.8566, // Default to Paris
  lng: 2.3522
};

const InteractiveMap = ({ itinerary, selectedLocation, setSelectedLocation }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [map, setMap] = useState(null);
  const [geocodedLocations, setGeocodedLocations] = useState([]);
  const geocoderRef = useRef(null);

  // Geocode locations to get exact lat/lng for markers and InfoWindow positioning
  useEffect(() => {
    if (!isLoaded || !itinerary || itinerary.length === 0) return;
    
    // We only need to geocode if we haven't already and we have google maps loaded
    if (!geocoderRef.current) {
      // eslint-disable-next-line no-undef
      geocoderRef.current = new google.maps.Geocoder();
    }

    const geocodeAll = async () => {
      const results = [];
      for (const item of itinerary) {
        if (item.location) {
          try {
            const response = await geocoderRef.current.geocode({ address: item.location });
            if (response.results && response.results.length > 0) {
              results.push({
                ...item,
                latLng: response.results[0].geometry.location
              });
            }
          } catch (e) {
            console.warn("Geocoding failed for:", item.location, e);
          }
        }
      }
      setGeocodedLocations(results);
    };

    geocodeAll();
  }, [itinerary, isLoaded]);

  // Calculate route
  useEffect(() => {
    if (!isLoaded || !itinerary || itinerary.length < 2) {
      setDirectionsResponse(null);
      return;
    }

    const locations = itinerary.filter(item => item.location);
    if (locations.length < 2) return;

    const calculateRoute = async () => {
      // eslint-disable-next-line no-undef
      const directionsService = new google.maps.DirectionsService();
      
      const origin = locations[0].location;
      const destination = locations[locations.length - 1].location;
      
      const waypoints = locations.slice(1, -1).map(item => ({
        location: item.location,
        stopover: true
      }));

      try {
        const results = await directionsService.route({
          origin: origin,
          destination: destination,
          waypoints: waypoints,
          // eslint-disable-next-line no-undef
          travelMode: google.maps.TravelMode.DRIVING
        });
        
        setDirectionsResponse(results);
      } catch (error) {
        console.warn("Error calculating directions. The path won't be drawn, but markers will still show. Ensure Directions API is enabled.", error);
        setDirectionsResponse(null); // Fallback to markers only
      }
    };

    calculateRoute();
  }, [itinerary, isLoaded]);

  // Pan to selected location
  useEffect(() => {
    if (map && selectedLocation && geocodedLocations.length > 0) {
      const geoLoc = geocodedLocations.find(loc => loc.title === selectedLocation.title);
      if (geoLoc && geoLoc.latLng) {
        map.panTo(geoLoc.latLng);
        map.setZoom(15);
      }
    }
  }, [selectedLocation, map, geocodedLocations]);

  // Auto-fit bounds if no selected location
  useEffect(() => {
    if (map && !selectedLocation && geocodedLocations.length > 0) {
      // eslint-disable-next-line no-undef
      const bounds = new google.maps.LatLngBounds();
      geocodedLocations.forEach(loc => bounds.extend(loc.latLng));
      map.fitBounds(bounds);
    }
  }, [geocodedLocations, map, selectedLocation]);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  if (loadError) {
    return (
      <div className="map-placeholder" style={{ background: 'rgba(255, 0, 0, 0.05)', color: '#ef4444', border: '1px dashed #ef4444' }}>
        Failed to load Google Maps. Please verify your API Key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="map-placeholder">
        <div className="loading-spinner"></div>
        <p style={{marginLeft: '10px'}}>Loading Map Engine...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {/* Draw Path (suppress default markers) */}
        {directionsResponse && (
          <DirectionsRenderer 
            directions={directionsResponse}
            options={{
              suppressMarkers: true, // We will draw custom markers!
              polylineOptions: {
                strokeColor: '#3b82f6',
                strokeWeight: 4,
                strokeOpacity: 0.8
              }
            }}
          />
        )}
        
        {/* Draw Custom Markers */}
        {geocodedLocations.map((item, index) => (
          <Marker
            key={index}
            position={item.latLng}
            onClick={() => setSelectedLocation(item)}
            animation={selectedLocation?.title === item.title ? 1 /* google.maps.Animation.BOUNCE */ : 0}
            icon={{
              url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233b82f6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>',
              scaledSize: new window.google.maps.Size(32, 32),
              anchor: new window.google.maps.Point(16, 32)
            }}
          />
        ))}

        {/* InfoWindow for Selected Location */}
        {selectedLocation && geocodedLocations.find(loc => loc.title === selectedLocation.title)?.latLng && (
          <InfoWindow
            position={geocodedLocations.find(loc => loc.title === selectedLocation.title).latLng}
            onCloseClick={() => setSelectedLocation(null)}
            options={{ pixelOffset: new window.google.maps.Size(0, -32) }}
          >
            <div style={{ padding: '4px', maxWidth: '200px', color: '#1a1a1c' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#3b82f6' }}>{selectedLocation.title}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>{selectedLocation.description}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

// Subtle modern map style
const mapStyles = [
  { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
  { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
  { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }
];

export default InteractiveMap;
