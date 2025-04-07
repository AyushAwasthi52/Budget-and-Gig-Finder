"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { jobsApi } from "@/lib/api";

interface JobPostingFormProps {
  onSuccess?: () => void;
}

export function JobPostingForm({ onSuccess }: JobPostingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    budget: "",
    type: "remote",
    location: "remote",
    requirements: "",
    deadline: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await jobsApi.create({
        ...jobData,
        budget: parseFloat(jobData.budget),
        deadline: new Date(jobData.deadline).toISOString(),
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to create job posting:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Post a New Job</CardTitle>
        <CardDescription>Create a new job posting for students</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={jobData.title}
              onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              value={jobData.description}
              onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
              required
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget ($)</Label>
            <Input
              id="budget"
              type="number"
              min="0"
              step="0.01"
              value={jobData.budget}
              onChange={(e) => setJobData({ ...jobData, budget: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Job Type</Label>
            <RadioGroup
              value={jobData.type}
              onValueChange={(value) => setJobData({ ...jobData, type: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="remote" id="remote" />
                <Label htmlFor="remote" className="text-sm font-normal">
                  Remote
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="campus" id="campus" />
                <Label htmlFor="campus" className="text-sm font-normal">
                  On Campus
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <RadioGroup
              value={jobData.location}
              onValueChange={(value) => setJobData({ ...jobData, location: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="writing" id="writing" />
                <Label htmlFor="writing" className="text-sm font-normal">
                  Writing
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="design" id="design" />
                <Label htmlFor="design" className="text-sm font-normal">
                  Design
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tutoring" id="tutoring" />
                <Label htmlFor="tutoring" className="text-sm font-normal">
                  Tutoring
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              value={jobData.requirements}
              onChange={(e) => setJobData({ ...jobData, requirements: e.target.value })}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Application Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={jobData.deadline}
              onChange={(e) => setJobData({ ...jobData, deadline: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <Plus className="mr-2 h-4 w-4" />
            {isSubmitting ? "Posting..." : "Post Job"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 