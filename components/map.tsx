"use client";

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Create a simple custom icon
const customIcon = new L.DivIcon({
  html: `<div class="w-6 h-6 bg-purple-500 rounded-full border-2 border-white shadow-lg"></div>`,
  className: 'custom-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

interface MapProps {
  center: [number, number];
  zoom: number;
  onClick: (e: any) => void;
  marker: { lat: number; lng: number };
}

function MapEvents({ onClick }: { onClick: (e: any) => void }) {
  useMapEvents({
    click: onClick,
  });
  return null;
}

function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center);
  return null;
}

export default function Map({ center, zoom, onClick, marker }: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
      dragging={true}
      doubleClickZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={18}
      />
      <MapEvents onClick={onClick} />
      <MapCenterUpdater center={center} />
      <Marker position={[marker.lat, marker.lng]} icon={customIcon} />
    </MapContainer>
  );
} 