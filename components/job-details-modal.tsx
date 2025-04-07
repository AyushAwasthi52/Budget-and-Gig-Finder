"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { jobsApi } from "@/lib/api";
import { useState } from "react";
import { X } from "lucide-react";

interface JobDetailsModalProps {
  job: {
    id: string;
    title: string;
    description: string;
    budget: number;
    type: string;
    location: string;
    requirements: string;
    deadline: string;
    createdAt: string;
    status: string;
    companyName: string;
    applications: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
  showDeleteButton?: boolean;
  onStatusChange?: (jobId: string, newStatus: string) => void;
  userRole?: string;
}

export function JobDetailsModal({
  job,
  isOpen,
  onClose,
  onDelete,
  showDeleteButton = false,
  onStatusChange,
  userRole = "student"
}: JobDetailsModalProps) {
  const [isActive, setIsActive] = useState(job.status === "active");

  const handleStatusToggle = async () => {
    if (!onStatusChange) return;
    
    const newStatus = isActive ? "completed" : "active";
    try {
      await jobsApi.update(job.id, { status: newStatus });
      onStatusChange(job.id, newStatus);
      setIsActive(!isActive);
    } catch (error) {
      console.error("Error updating job status:", error);
      alert("Failed to update job status");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{job.title}</h2>
            <Badge variant={job.status === "active" ? "default" : "secondary"}>
              {job.status}
            </Badge>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Company</h3>
            <p className="text-muted-foreground">{job.companyName}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold">Budget</h3>
              <p className="text-muted-foreground">₹{job.budget}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Type</h3>
              <p className="text-muted-foreground capitalize">{job.type}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Location</h3>
              <p className="text-muted-foreground">{job.location}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Applications</h3>
              <p className="text-muted-foreground">{job.applications || 0}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Requirements</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{job.requirements}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Deadline</h3>
            <p className="text-muted-foreground">{new Date(job.deadline).toLocaleDateString()}</p>
          </div>

          {userRole === "provider" && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={isActive}
                  onCheckedChange={handleStatusToggle}
                />
                <Label htmlFor="status">
                  {isActive ? "Active" : "Completed"}
                </Label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {showDeleteButton && (
              <Button 
                variant="destructive" 
                onClick={onDelete}
              >
                Delete Job
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 