"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { jobsApi, userApi } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LocationPicker } from "./location-picker";

interface PostJobFormProps {
  onClose: () => void;
  onSuccess?: (job: any) => void;
}

export function PostJobForm({ onClose, onSuccess }: PostJobFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    type: "",
    location: "",
    coordinates: {
      lat: 51.5074, // Default to London coordinates
      lng: -0.1278
    },
    requirements: "",
    deadline: "",
    companyName: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await userApi.get();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data");
      }
    };

    fetchUserData();
  }, []);

  const handleLocationSearch = async (query: string) => {
    setIsSearchingLocation(true);
    try {
      // Use OpenStreetMap's Nominatim API to search for locations
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      
      if (data && data[0]) {
        setFormData(prev => ({
          ...prev,
          location: data[0].display_name,
          coordinates: {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          }
        }));
      }
    } catch (error) {
      console.error("Error searching location:", error);
      setError("Failed to search location");
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!userData?.companyName) {
        throw new Error("Company information not found");
      }

      if (!formData.coordinates.lat || !formData.coordinates.lng) {
        throw new Error("Please provide job location coordinates");
      }

      const jobData = {
        ...formData,
        budget: Number(formData.budget),
        status: "active",
        applications: 0,
        companyName: userData.companyName,
        createdAt: new Date().toISOString(),
      };

      console.log("Creating job with data:", jobData);
      const newJob = await jobsApi.create(jobData);
      console.log("Job created successfully");

      router.refresh();
      onSuccess?.(newJob);
      onClose();
    } catch (error) {
      console.error("Error creating job:", error);
      setError(error instanceof Error ? error.message : "Failed to create job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!userData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
          <p className="text-center text-red-500">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a New Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                required
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Job Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <LocationPicker
                coordinates={formData.coordinates}
                onCoordinatesChange={(coords) => {
                  setFormData(prev => ({
                    ...prev,
                    coordinates: coords
                  }));
                }}
                onLocationSearch={handleLocationSearch}
                isLoading={isSearchingLocation}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <div className="flex gap-2 sticky bottom-0 bg-background py-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post Job"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 