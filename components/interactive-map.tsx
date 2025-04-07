"use client";

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Create a simple custom icon
const customIcon = new L.DivIcon({
  html: `<div class="w-6 h-6 bg-purple-500 rounded-full border-2 border-white shadow-lg"></div>`,
  className: 'custom-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

interface InteractiveMapProps {
  initialLocation: { lat: number; lng: number };
  onLocationChange: (location: { lat: number; lng: number }) => void;
}

function MapEvents({ onClick }: { onClick: (e: any) => void }) {
  useMapEvents({
    click: onClick
  });
  return null;
}

function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export function InteractiveMap({ initialLocation, onLocationChange }: InteractiveMapProps) {
  const [marker, setMarker] = useState(initialLocation);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");
  const [error, setError] = useState("");

  const handleMapClick = async (e: any) => {
    const newLocation = {
      lat: e.latlng.lat,
      lng: e.latlng.lng
    };
    setMarker(newLocation);
    onLocationChange(newLocation);

    // Fetch location name using reverse geocoding
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLocation.lat}&lon=${newLocation.lng}`
      );
      const data = await response.json();
      if (data && data.display_name) {
        console.log("Selected location:", data.display_name);
      }
    } catch (error) {
      console.error("Error getting location name:", error);
    }
  };

  const handleResetLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      setMarker(newLocation);
      onLocationChange(newLocation);
    } catch (error) {
      console.error("Error getting current location:", error);
      alert("Failed to get current location. Please check your location settings.");
    }
  };

  const handleCoordinateSubmit = () => {
    setError("");
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng)) {
      setError("Please enter valid numbers for coordinates");
      return;
    }

    if (lat < -90 || lat > 90) {
      setError("Latitude must be between -90 and 90");
      return;
    }

    if (lng < -180 || lng > 180) {
      setError("Longitude must be between -180 and 180");
      return;
    }

    const newLocation = { lat, lng };
    setMarker(newLocation);
    onLocationChange(newLocation);
    setIsDialogOpen(false);
    setLatInput("");
    setLngInput("");
  };

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-2 right-2 z-[1000] flex gap-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-2 bg-white shadow-md hover:bg-gray-100"
            >
              <MapPin className="h-4 w-4" />
              Enter Coordinates
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Coordinates</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude (-90 to 90)</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  placeholder="e.g., 40.7128"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude (-180 to 180)</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={lngInput}
                  onChange={(e) => setLngInput(e.target.value)}
                  placeholder="e.g., -74.0060"
                />
              </div>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <Button onClick={handleCoordinateSubmit} className="w-full">
                Set Location
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-2 bg-white shadow-md hover:bg-gray-100"
          onClick={handleResetLocation}
        >
          <MapPin className="h-4 w-4" />
          Use Live Location
        </Button>
      </div>
      <MapContainer
        center={[marker.lat, marker.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        dragging={true}
        doubleClickZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />
        <MapEvents onClick={handleMapClick} />
        <MapCenterUpdater center={[marker.lat, marker.lng]} />
        <Marker position={[marker.lat, marker.lng]} icon={customIcon} />
      </MapContainer>
    </div>
  );
} 