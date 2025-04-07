import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { getCurrentLocation } from "@/lib/geo-utils";

interface LocationRadiusSelectorProps {
  radius: number;
  onRadiusChange: (radius: number) => void;
  userLocation: { lat: number; lng: number } | null;
  onLocationUpdate: (location: { lat: number; lng: number } | null) => void;
}

export function LocationRadiusSelector({
  radius,
  onRadiusChange,
  userLocation,
  onLocationUpdate
}: LocationRadiusSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetLocation = async () => {
    setIsLoading(true);
    try {
      const location = await getCurrentLocation();
      onLocationUpdate(location);
    } catch (error) {
      console.error("Error getting location:", error);
      onLocationUpdate(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-gray-500" />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={radius}
              onChange={(e) => onRadiusChange(Number(e.target.value))}
              className="w-20"
              min={1}
              max={100}
            />
            <span className="text-sm text-gray-500">km radius</span>
          </div>
          <Slider
            value={[radius]}
            onValueChange={(values) => onRadiusChange(values[0])}
            min={1}
            max={100}
            step={1}
            className="w-32"
          />
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Getting location...
        </div>
      ) : userLocation ? (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <MapPin className="h-4 w-4" />
          Location found
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleGetLocation}
          className="flex items-center gap-2"
        >
          <MapPin className="h-4 w-4" />
          Get Location
        </Button>
      )}
    </div>
  );
} 