"use client";

import { useState, useCallback } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentLocation } from "@/lib/geo-utils";
import dynamic from "next/dynamic";
import debounce from 'lodash/debounce';

// Dynamically import the map component to avoid SSR issues
const MapWithNoSSR = dynamic(() => import('./map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="animate-pulse text-gray-500">Loading map...</div>
    </div>
  )
});

interface LocationPickerProps {
  coordinates: { lat: number; lng: number };
  onCoordinatesChange: (coords: { lat: number; lng: number }) => void;
  onLocationSearch: (query: string) => Promise<void>;
  isLoading?: boolean;
}

export function LocationPicker({
  coordinates,
  onCoordinatesChange,
  onLocationSearch,
  isLoading
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim()) {
        onLocationSearch(query);
      }
    }, 500),
    [onLocationSearch]
  );

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const coords = await getCurrentLocation();
      onCoordinatesChange(coords);
      
      // Fetch location name using reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        setSearchQuery(data.display_name);
        onLocationSearch(data.display_name);
      }
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          placeholder="Search location..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pr-8"
        />
        {isLoading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      <div className="relative h-[300px] rounded-md border overflow-hidden">
        <MapWithNoSSR
          center={[coordinates.lat, coordinates.lng]}
          zoom={13}
          onClick={(e: { latlng: { lat: number; lng: number } }) => {
            onCoordinatesChange(e.latlng);
          }}
          marker={coordinates}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGetCurrentLocation}
        disabled={isGettingLocation}
        className="w-full"
      >
        {isGettingLocation ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            Getting Location...
          </div>
        ) : (
          <>
            <MapPin className="mr-2 h-4 w-4" />
            Use Current Location
          </>
        )}
      </Button>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Latitude</label>
          <Input
            type="number"
            step="any"
            value={coordinates.lat}
            onChange={(e) => onCoordinatesChange({ ...coordinates, lat: Number(e.target.value) })}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Longitude</label>
          <Input
            type="number"
            step="any"
            value={coordinates.lng}
            onChange={(e) => onCoordinatesChange({ ...coordinates, lng: Number(e.target.value) })}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
} 