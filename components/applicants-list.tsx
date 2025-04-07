"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { applicationsApi } from "@/lib/api";
import { format } from "date-fns";
import { User, Mail, Phone, Calendar } from "lucide-react";

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  name: string;
  email: string;
  phone: string;
  coverLetter: string;
  status: string;
  appliedAt: string;
}

interface ApplicantsListProps {
  applications: Application[];
  onStatusChange: (applicationId: string, newStatus: string) => void;
  onDelete?: (applicationId: string) => void;
}

export function ApplicantsList({ applications, onStatusChange, onDelete }: ApplicantsListProps) {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Sort applications by timestamp in descending order (newest first)
  const sortedApplications = [...applications].sort((a, b) => {
    return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
  });

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      await applicationsApi.update(applicationId, { status: newStatus });
      onStatusChange(applicationId, newStatus);
    } catch (error) {
      console.error("Error updating application status:", error);
      alert("Failed to update application status");
    }
  };

  const handleDelete = async (applicationId: string) => {
    try {
      await applicationsApi.delete(applicationId);
      if (onDelete) {
        onDelete(applicationId);
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("Failed to delete application");
    }
  };

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "accepted":
        return "outline";
      case "rejected":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "default";
    }
  };

  if (sortedApplications.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No applications received yet.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {sortedApplications.map((application) => (
          <Card key={application.id} className="overflow-hidden">
            <CardHeader className="border-b bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{application.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{application.jobTitle}</p>
                  </div>
                </div>
                <Badge 
                  variant={getStatusColor(application.status)} 
                  className={`capitalize ${application.status === "accepted" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}`}
                >
                  {application.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{application.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{application.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      Applied on {format(new Date(application.appliedAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Cover Letter</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">{application.coverLetter}</p>
                </div>
              </div>
            </CardContent>
            <div className="border-t bg-muted/50 p-4">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedApplication(application);
                    setShowDetails(true);
                  }}
                >
                  View Details
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(application.id)}
                >
                  Delete
                </Button>
                {application.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(application.id, "accepted")}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleStatusChange(application.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Job Information</h3>
                <div className="rounded-lg border p-4">
                  <p className="font-medium">{selectedApplication.jobTitle}</p>
                  <p className="text-sm text-muted-foreground">{selectedApplication.companyName}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Applicant Information</h3>
                <div className="rounded-lg border p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p>{selectedApplication.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p>{selectedApplication.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p>{selectedApplication.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Cover Letter</h3>
                <div className="rounded-lg border p-4">
                  <p className="whitespace-pre-wrap text-sm">{selectedApplication.coverLetter}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                {selectedApplication.status === "pending" && (
                  <>
                    <Button
                      onClick={() => handleStatusChange(selectedApplication.id, "accepted")}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleStatusChange(selectedApplication.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

