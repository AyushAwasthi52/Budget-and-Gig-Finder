"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { jobsApi } from "@/lib/api";
import { format } from "date-fns";
import { ApplyJobForm } from "./apply-job-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface Job {
  id: string;
  title: string;
  companyName: string;
  budget: string;
  type: string;
  location: string;
  description: string;
  requirements: string;
  status: string;
  postedAt: string;
  applications: any[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface GigsListProps {
  searchQuery: string;
  selectedFilter: string;
  userRole: "student" | "provider";
  onSearchChange?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
  userLocation?: { lat: number; lng: number } | null;
  locationRadius?: number;
  onJobSelect?: (job: Job) => void;
}

export function GigsList({ 
  searchQuery, 
  selectedFilter, 
  userRole, 
  onSearchChange, 
  onFilterChange,
  userLocation,
  locationRadius = 10,
  onJobSelect
}: GigsListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching jobs...");
      const allJobs = await jobsApi.getAll();
      console.log("Fetched jobs details:", {
        totalJobs: allJobs.length,
        jobsWithCoordinates: allJobs.filter((job: Job) => job.coordinates).length,
        jobsByStatus: allJobs.reduce((acc: Record<string, number>, job: Job) => {
          acc[job.status] = (acc[job.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
      setJobs(allJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("GigsList mounted, fetching jobs...");
    fetchJobs();
  }, []);

  const handleStatusToggle = async (jobId: string, newStatus: string) => {
    try {
      await jobsApi.update(jobId, { status: newStatus });
      await fetchJobs(); // Refresh the jobs list
    } catch (error) {
      console.error("Error updating job status:", error);
      alert("Failed to update job status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      default:
        return "default";
    }
  };

  // Function to calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredJobs = jobs.filter((job: Job) => {
    const matchesSearch = searchQuery === "" || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" || 
      job.status === selectedFilter;

    // For students, only show active jobs within radius
    if (userRole === "student") {
      // If no location is set, don't show any jobs
      if (!userLocation) {
        return false;
      }

      // If job has no coordinates, don't show it
      if (!job.coordinates) {
        return false;
      }

      // Calculate distance between student and job
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        job.coordinates.lat,
        job.coordinates.lng
      );

      // Only show jobs within radius and active status
      const isWithinRadius = distance <= locationRadius;
      const isActive = job.status === "active";
      return matchesSearch && isActive && isWithinRadius;
    }

    // For providers, show all jobs matching search and filter
    return matchesSearch && matchesFilter;
  });

  // Calculate jobs within radius for the count
  const jobsWithinRadius = jobs.filter((job: Job) => {
    if (!userLocation || !job.coordinates) return false;
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      job.coordinates.lat,
      job.coordinates.lng
    );
    return distance <= locationRadius && job.status === "active";
  });

  // Add a message when no jobs are found within the radius
  if (userRole === "student" && userLocation && filteredJobs.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No active jobs found within {locationRadius}km of your location. Try adjusting your search radius.
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading jobs...</div>;
  }

  if (filteredJobs.length === 0) {
    return (
      <div className="text-center text-gray-500">
        {userRole === "student" 
          ? "No active jobs found. Try adjusting your search or location radius."
          : "No jobs found. Try adjusting your filters."}
      </div>
    );
  }

  return (
    <>
      <div className="text-sm text-gray-500 mb-4">
        {userRole === "student" 
          ? `Showing ${filteredJobs.length} of ${jobsWithinRadius.length} available jobs within ${locationRadius}km`
          : `Showing ${filteredJobs.length} of ${jobs.length} jobs`}
      </div>
      <div className="h-[calc(100vh-200px)] overflow-y-auto">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job: Job) => (
            <Card key={job.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <p className="text-sm text-gray-500">{job.companyName}</p>
                  </div>
                  {userRole === "provider" && (
                    <Badge variant={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  )}
                  {userRole === "student" && userLocation && job.coordinates && (
                    <div className="text-sm text-gray-500">
                      {calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        job.coordinates.lat,
                        job.coordinates.lng
                      ).toFixed(1)} km away
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Budget:</span>
                    <span>{job.budget}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Type:</span>
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Location:</span>
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Applications:</span>
                    <span>{job.applications?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      if (onJobSelect) {
                        onJobSelect(job);
                      } else {
                        setSelectedJob(job);
                        setShowDetails(true);
                      }
                    }}
                  >
                    View Details
                  </Button>
                  {userRole === "student" && (
                    <Button
                      className="flex-1"
                      onClick={() => {
                        setSelectedJob(job);
                        setShowApplyForm(true);
                      }}
                    >
                      Apply
                    </Button>
                  )}
                  {userRole === "provider" && (
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to delete this job?")) {
                          try {
                            await jobsApi.delete(job.id);
                            setJobs(jobs.filter(j => j.id !== job.id));
                          } catch (error) {
                            console.error("Error deleting job:", error);
                            alert("Failed to delete job");
                          }
                        }
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {!onJobSelect && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Job Details</DialogTitle>
            </DialogHeader>
            {selectedJob && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Job Title</h3>
                  <p>{selectedJob.title}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Company</h3>
                  <p>{selectedJob.companyName}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Budget</h3>
                  <p>{selectedJob.budget}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Type</h3>
                  <p>{selectedJob.type}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Location</h3>
                  <p>{selectedJob.location}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Description</h3>
                  <p className="whitespace-pre-wrap">{selectedJob.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Requirements</h3>
                  <p className="whitespace-pre-wrap">{selectedJob.requirements}</p>
                </div>
                {userRole === "provider" && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleStatusToggle(selectedJob.id, "completed")}
                    >
                      Mark as Completed
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={async () => {
                        try {
                          await jobsApi.delete(selectedJob.id);
                          await fetchJobs(); // Refresh the jobs list
                          setShowDetails(false);
                          setSelectedJob(null);
                        } catch (error) {
                          console.error("Error deleting job:", error);
                          alert("Failed to delete job");
                        }
                      }}
                    >
                      Delete Job
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {showApplyForm && selectedJob && (
        <ApplyJobForm
          job={selectedJob}
          isOpen={showApplyForm}
          onClose={() => {
            setShowApplyForm(false);
            setSelectedJob(null);
          }}
          onSuccess={() => {
            // Refresh jobs to update application count
            fetchJobs();
          }}
        />
      )}
    </>
  );
}

