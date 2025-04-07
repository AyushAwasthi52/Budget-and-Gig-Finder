"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Bell, Building, GraduationCap, Plus, Search, Settings, Users, Home, Briefcase, PieChart, User, Clock, CheckCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { MobileNav } from "@/components/mobile-nav";
import { GigsList } from "@/components/gigs-list";
import { PostJobForm } from "@/components/post-job-form";
import { ApplicantsList } from "@/components/applicants-list";
import { userApi, settingsApi, jobsApi, applicationsApi, notificationsApi } from "@/lib/api";
import { JobDetailsModal } from "@/components/job-details-modal";
import { Badge } from "@/components/ui/badge";
import { ProviderJobCard } from "@/components/provider-job-card";
import { Notifications } from "@/components/notifications";
import type { Notification } from "@/lib/api";
import type { Job } from "@/components/gigs-list";
import { ProfileModal } from "@/components/profile-modal";
import { ProviderProfileModal } from "@/components/provider-profile-modal";
import { SettingsModal } from "@/components/settings-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveMap } from "@/components/interactive-map";

type TabType = "overview" | "gigs" | "browse" | "jobs" | "applicants" | "profile";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [userRole, setUserRole] = useState<"student" | "provider">("student");
  const [userData, setUserData] = useState<any>(null);
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>(searchParams.get("tab") as TabType || "overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationRadius, setLocationRadius] = useState<number>(10); // Default 10km radius
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    const role = searchParams.get("role") || "student";
    setUserRole(role as "student" | "provider");
    setSelectedFilter(role === "student" ? "active" : "all");
  }, [searchParams]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await userApi.get();
        setUserData(userData);
        setPersonalInfo(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchPostedJobs = async () => {
      if (userRole === "provider") {
        try {
          const jobs = await jobsApi.getAll();
          setPostedJobs(jobs);
        } catch (error) {
          console.error("Error fetching posted jobs:", error);
          setError("Failed to load posted jobs");
        }
      }
    };

    fetchPostedJobs();
  }, [userRole]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const allApplications = await applicationsApi.getAll();
        setApplications(allApplications);
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };

    if (userRole === "provider" && activeTab === "applicants") {
      fetchApplications();
    }
  }, [userRole, activeTab]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userNotifications = await notificationsApi.getAll(userData?.id);
        setNotifications(userNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (userData?.id) {
      fetchNotifications();
    }
  }, [userData?.id]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Apply dark mode based on user settings
    if (userData?.settings?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userData?.settings?.darkMode]);

  useEffect(() => {
    if (userRole === "student" && navigator.geolocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoadingLocation(false);
        }
      );
    }
  }, [userRole]);

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await jobsApi.delete(jobId);
        setPostedJobs(postedJobs.filter(job => job.id !== jobId));
      } catch (error) {
        console.error("Error deleting job:", error);
        alert("Failed to delete job");
      }
    }
  };

  const handleJobStatusChange = async (jobId: string, newStatus: string) => {
    try {
      await jobsApi.update(jobId, { status: newStatus });
      setPostedJobs(postedJobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      ));

      // Create notification for provider
      const job = postedJobs.find(j => j.id === jobId);
      if (job && newStatus === "completed") {
        await notificationsApi.create({
          type: "job_completed",
          title: "Job Completed",
          message: `The job "${job.title}" has been marked as completed`,
          jobId: job.id,
          userId: userData.id,
        });
      }
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  const handleApplicationStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      await applicationsApi.update(applicationId, { status: newStatus });
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));

      // Create notification for student
      const application = applications.find(app => app.id === applicationId);
      if (application) {
        let notificationType: Notification["type"];
        let title: string;
        let message: string;

        switch (newStatus) {
          case "reviewed":
            notificationType = "application_reviewed";
            title = "Application Reviewed";
            message = `Your application for ${application.jobTitle} has been reviewed`;
            break;
          case "accepted":
            notificationType = "application_accepted";
            title = "Application Accepted!";
            message = `Congratulations! Your application for ${application.jobTitle} has been accepted`;
            break;
          case "rejected":
            notificationType = "application_rejected";
            title = "Application Rejected";
            message = `Your application for ${application.jobTitle} has been rejected`;
            break;
          default:
            return;
        }

        await notificationsApi.create({
          type: notificationType,
          title,
          message,
          jobId: application.jobId,
          applicationId: application.id,
          userId: application.userId,
        });
      }
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  const handleApplicationDelete = async (applicationId: string) => {
    try {
      await applicationsApi.delete(applicationId);
      setApplications(applications.filter(app => app.id !== applicationId));
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  const handlePostJobSuccess = async (newJob: any) => {
    setPostedJobs([...postedJobs, newJob]);
    setShowPostJobModal(false);

    // Create notification for students
    await notificationsApi.create({
      type: "new_job",
      title: "New Job Posted",
      message: `A new job "${newJob.title}" has been posted by ${newJob.companyName}`,
      jobId: newJob.id,
      userId: "all", // This will be shown to all students
    });
  };

  const handleNotificationClick = async (notification: Notification) => {
    await notificationsApi.delete(notification.id);
    setNotifications(notifications.filter(n => n.id !== notification.id));

    // Navigate based on notification type
    if (notification.jobId) {
      const job = postedJobs.find(j => j.id === notification.jobId);
      if (job) {
        setSelectedJob(job);
        setShowJobDetails(true);
      }
    } else if (notification.applicationId) {
      setActiveTab("applicants");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleProfileUpdate = (updatedData: any) => {
    setUserData(updatedData);
    setPersonalInfo(updatedData);
  };

  const handleSettingsUpdate = (updatedData: any) => {
    setUserData(updatedData);
    // Apply dark mode if changed
    if (updatedData.settings?.darkMode !== userData.settings?.darkMode) {
      if (updatedData.settings?.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
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

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  const fetchJobs = async () => {
    try {
      const jobs = await jobsApi.getAll();
      setPostedJobs(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-gradient-to-r from-purple-600 to-indigo-600 px-4 shadow-md">
        <div className="flex items-center gap-2">
          {userRole === "student" ? (
            <GraduationCap className="h-5 w-5 text-white" />
          ) : (
            <Building className="h-5 w-5 text-white" />
          )}
          <h1 className="text-lg font-bold text-white">
            {userRole === "student" ? "Student Dashboard" : "Provider Dashboard"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Notifications
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onMarkAllRead={handleMarkAllRead}
          />
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setShowSettingsModal(true)}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Navigation */}
        <nav className="hidden w-64 border-r bg-gradient-to-b from-purple-50 to-white p-4 md:block dark:from-gray-900 dark:to-gray-800">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {userRole === "student" ? (
                <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              ) : (
                <Building className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              )}
              <h2 className="font-semibold text-purple-700 dark:text-purple-300">Navigation</h2>
            </div>
            <Separator className="bg-purple-200 dark:bg-gray-600" />
            <div className="space-y-1">
              {userRole === "student" ? (
                <>
                  <Button
                    variant={activeTab === "gigs" ? "secondary" : "ghost"}
                    className="w-full justify-start hover:bg-purple-100 dark:hover:bg-gray-700"
                    onClick={() => handleTabChange("gigs")}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Gigs
                  </Button>
                  <Button
                    variant={activeTab === "profile" ? "secondary" : "ghost"}
                    className="w-full justify-start hover:bg-purple-100 dark:hover:bg-gray-700"
                    onClick={() => handleTabChange("profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant={activeTab === "browse" ? "secondary" : "ghost"}
                    className="w-full justify-start hover:bg-purple-100 dark:hover:bg-gray-700"
                    onClick={() => handleTabChange("browse")}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Browse
                  </Button>
                  <Button
                    variant={activeTab === "jobs" ? "secondary" : "ghost"}
                    className="w-full justify-start hover:bg-purple-100 dark:hover:bg-gray-700"
                    onClick={() => handleTabChange("jobs")}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Jobs
                  </Button>
                  <Button
                    variant={activeTab === "applicants" ? "secondary" : "ghost"}
                    className="w-full justify-start hover:bg-purple-100 dark:hover:bg-gray-700"
                    onClick={() => handleTabChange("applicants")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Applicants
                  </Button>
                  <Button
                    variant={activeTab === "profile" ? "secondary" : "ghost"}
                    className="w-full justify-start hover:bg-purple-100 dark:hover:bg-gray-700"
                    onClick={() => handleTabChange("profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50 p-4 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {userRole === "provider" ? (
                <>
                  <Card className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        <h3 className="text-sm font-medium">Total Jobs</h3>
                      </div>
                      <p className="mt-2 text-2xl font-bold">{postedJobs.length}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        <h3 className="text-sm font-medium">Active Jobs</h3>
                      </div>
                      <p className="mt-2 text-2xl font-bold">
                        {postedJobs.filter((job) => job.status === "active").length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        <h3 className="text-sm font-medium">Completed Jobs</h3>
                      </div>
                      <p className="mt-2 text-2xl font-bold">
                        {postedJobs.filter((job) => job.status === "completed").length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-orange-500 to-pink-500 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <h3 className="text-sm font-medium">Total Applications</h3>
                      </div>
                      <p className="mt-2 text-2xl font-bold">{applications.length}</p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        <h3 className="text-sm font-medium">Available Gigs</h3>
                      </div>
                      <p className="mt-2 text-2xl font-bold">{postedJobs.filter(job => job.status === "active").length}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        <h3 className="text-sm font-medium">Applied Jobs</h3>
                      </div>
                      <p className="mt-2 text-2xl font-bold">{applications.length}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        <h3 className="text-sm font-medium">Accepted Applications</h3>
                      </div>
                      <p className="mt-2 text-2xl font-bold">
                        {applications.filter(app => app.status === "accepted").length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-orange-500 to-pink-500 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        <h3 className="text-sm font-medium">Pending Applications</h3>
                      </div>
                      <p className="mt-2 text-2xl font-bold">
                        {applications.filter(app => app.status === "pending").length}
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Welcome Card */}
            <Card className="border-t-4 border-t-purple-500">
              <CardHeader>
                <CardTitle className="text-purple-700 dark:text-purple-300">Welcome!</CardTitle>
                <CardDescription>
                  {userRole === "student" 
                    ? "Track your gigs and find new opportunities"
                    : "Manage your job postings, review applications, and track your hiring process"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                      {userRole === "student" ? (
                        <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-300">
                        {userRole === "student" ? userData.name : personalInfo.companyName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {userRole === "student" ? "Student" : "Provider"}
                      </p>
                    </div>
                  </div>
                  {userRole === "provider" && (
                    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-lg border bg-purple-50 p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-700">
                        <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">Company Size</h3>
                        <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{personalInfo.companySize}</p>
                      </div>
                      <div className="rounded-lg border bg-purple-50 p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-700">
                        <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">Location</h3>
                        <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{personalInfo.location || "Not specified"}</p>
                      </div>
                      <div className="rounded-lg border bg-purple-50 p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-700">
                        <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">Industry</h3>
                        <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{personalInfo.industry || "Not specified"}</p>
                      </div>
                      <div className="rounded-lg border bg-purple-50 p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-700">
                        <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">Contact</h3>
                        <p className="mt-2 text-sm text-gray-900 dark:text-white">{personalInfo.contactEmail}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {activeTab === "gigs" && (
              <>
                {userRole === "student" && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Location Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                          {isLoadingLocation ? (
                            <span className="text-sm text-gray-500">Getting location...</span>
                          ) : userLocation ? (
                            <span className="text-sm text-green-600">Location found</span>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (navigator.geolocation) {
                                  setIsLoadingLocation(true);
                                  navigator.geolocation.getCurrentPosition(
                                    (position) => {
                                      setUserLocation({
                                        lat: position.coords.latitude,
                                        lng: position.coords.longitude
                                      });
                                      setIsLoadingLocation(false);
                                    },
                                    (error) => {
                                      console.error("Error getting location:", error);
                                      setIsLoadingLocation(false);
                                    }
                                  );
                                }
                              }}
                            >
                              Get Location
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <Label htmlFor="radius">Search Radius (km):</Label>
                          <Input
                            id="radius"
                            type="number"
                            min="1"
                            max="100"
                            value={locationRadius}
                            onChange={(e) => setLocationRadius(Number(e.target.value))}
                            className="w-24"
                          />
                          <Button
                            onClick={() => {
                              if (!userLocation) {
                                alert("Please enable location first");
                                return;
                              }
                              // Trigger a search with the current location and radius
                              setSearchQuery(""); // Clear any existing search
                              setSelectedFilter("active"); // Show only active jobs
                              // Force a refresh of the jobs list
                              fetchJobs();
                              console.log("Searching for jobs within", locationRadius, "km of location:", userLocation);
                            }}
                            className="ml-2"
                          >
                            Search in Area
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Map View</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          {userLocation ? (
                            <InteractiveMap
                              initialLocation={userLocation}
                              onLocationChange={(newLocation) => {
                                setUserLocation(newLocation);
                                // Update the search radius when location changes
                                setSearchQuery(""); // Clear any existing search
                                setSelectedFilter("active"); // Show only active jobs
                                fetchJobs(); // Refresh the jobs list
                              }}
                            />
                          ) : (
                            <p className="text-sm text-gray-500">Enable location to view map</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search gigs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>

                <GigsList 
                  searchQuery={searchQuery}
                  selectedFilter={selectedFilter}
                  userRole={userRole}
                  userLocation={userLocation}
                  locationRadius={locationRadius}
                />
              </>
            )}

            {activeTab === "browse" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1 md:w-64">
                      <Input
                        placeholder="Search jobs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    {userRole === "provider" && (
                      <RadioGroup
                        value={selectedFilter}
                        onValueChange={setSelectedFilter}
                        className="flex items-center gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="all" />
                          <Label htmlFor="all">All</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="active" id="active" />
                          <Label htmlFor="active">Active</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="completed" id="completed" />
                          <Label htmlFor="completed">Completed</Label>
                        </div>
                      </RadioGroup>
                    )}
                  </div>
                </div>

                {userRole === "student" && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Location Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                          {isLoadingLocation ? (
                            <span className="text-sm text-gray-500">Getting location...</span>
                          ) : userLocation ? (
                            <span className="text-sm text-green-600">Location found</span>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (navigator.geolocation) {
                                  setIsLoadingLocation(true);
                                  navigator.geolocation.getCurrentPosition(
                                    (position) => {
                                      setUserLocation({
                                        lat: position.coords.latitude,
                                        lng: position.coords.longitude
                                      });
                                      setIsLoadingLocation(false);
                                    },
                                    (error) => {
                                      console.error("Error getting location:", error);
                                      setIsLoadingLocation(false);
                                    }
                                  );
                                }
                              }}
                            >
                              Get Location
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <Label htmlFor="radius">Search Radius (km):</Label>
                          <Input
                            id="radius"
                            type="number"
                            min="1"
                            max="100"
                            value={locationRadius}
                            onChange={(e) => setLocationRadius(Number(e.target.value))}
                            className="w-24"
                          />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Map View</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          {userLocation ? (
                            <InteractiveMap
                              initialLocation={userLocation}
                              onLocationChange={(newLocation) => {
                                setUserLocation(newLocation);
                                // Update the search radius when location changes
                                setSearchQuery(""); // Clear any existing search
                                setSelectedFilter("active"); // Show only active jobs
                                fetchJobs(); // Refresh the jobs list
                              }}
                            />
                          ) : (
                            <p className="text-sm text-gray-500">Enable location to view map</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <GigsList
                  searchQuery={searchQuery}
                  selectedFilter={selectedFilter}
                  userRole={userRole}
                  onSearchChange={setSearchQuery}
                  onFilterChange={setSelectedFilter}
                  userLocation={userLocation}
                  locationRadius={locationRadius}
                />
              </div>
            )}

            {activeTab === "jobs" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Input
                      placeholder="Search jobs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-sm"
                    />
                    <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => setShowPostJobModal(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Job
                  </Button>
                </div>
                <GigsList
                  searchQuery={searchQuery}
                  selectedFilter={selectedFilter}
                  userRole="provider"
                  onSearchChange={setSearchQuery}
                  onFilterChange={setSelectedFilter}
                  onJobSelect={handleJobSelect}
                />
              </div>
            )}

            {activeTab === "applicants" && userRole === "provider" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Applications</h2>
                </div>
                <ApplicantsList 
                  applications={applications}
                  onStatusChange={handleApplicationStatusChange}
                  onDelete={handleApplicationDelete}
                />
              </div>
            )}

            {activeTab === "profile" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Profile</h2>
                  <Button onClick={() => setShowProfileModal(true)}>
                    Edit Profile
                  </Button>
                </div>

                {userRole === "student" ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label>Name</Label>
                            <p className="mt-1 text-lg">{userData.name}</p>
                          </div>
                          <div>
                            <Label>Email</Label>
                            <p className="mt-1 text-lg">{userData.email}</p>
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <p className="mt-1 text-lg">{userData.phone || "Not provided"}</p>
                          </div>
                          <div>
                            <Label>University</Label>
                            <p className="mt-1 text-lg">{userData.university || "Not provided"}</p>
                          </div>
                          <div>
                            <Label>Major</Label>
                            <p className="mt-1 text-lg">{userData.major || "Not provided"}</p>
                          </div>
                          <div>
                            <Label>Graduation Year</Label>
                            <p className="mt-1 text-lg">{userData.graduationYear || "Not provided"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Application Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="rounded-lg border p-4">
                            <h3 className="text-sm font-medium text-gray-500">Total Applications</h3>
                            <p className="mt-2 text-2xl font-bold">
                              {applications.filter(app => app.userId === userData.id).length}
                            </p>
                          </div>
                          <div className="rounded-lg border p-4">
                            <h3 className="text-sm font-medium text-gray-500">Accepted Applications</h3>
                            <p className="mt-2 text-2xl font-bold">
                              {applications.filter(app => app.userId === userData.id && app.status === "accepted").length}
                            </p>
                          </div>
                          <div className="rounded-lg border p-4">
                            <h3 className="text-sm font-medium text-gray-500">Active Applications</h3>
                            <p className="mt-2 text-2xl font-bold">
                              {applications.filter(app => app.userId === userData.id && app.status === "reviewed").length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Company Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label>Company Name</Label>
                            <p className="mt-1 text-lg">{userData.companyName}</p>
                          </div>
                          <div>
                            <Label>Company Size</Label>
                            <p className="mt-1 text-lg">{userData.companySize}</p>
                          </div>
                          <div>
                            <Label>Location</Label>
                            <p className="mt-1 text-lg">{userData.location || "Not provided"}</p>
                          </div>
                          <div>
                            <Label>Contact Email</Label>
                            <p className="mt-1 text-lg">{userData.contactEmail}</p>
                          </div>
                          <div>
                            <Label>Industry</Label>
                            <p className="mt-1 text-lg">{userData.industry || "Not provided"}</p>
                          </div>
                          <div>
                            <Label>Website</Label>
                            <p className="mt-1 text-lg">{userData.website || "Not provided"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Job Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="rounded-lg border p-4">
                            <h3 className="text-sm font-medium text-gray-500">Total Jobs Posted</h3>
                            <p className="mt-2 text-2xl font-bold">
                              {postedJobs.length}
                            </p>
                          </div>
                          <div className="rounded-lg border p-4">
                            <h3 className="text-sm font-medium text-gray-500">Active Jobs</h3>
                            <p className="mt-2 text-2xl font-bold">
                              {postedJobs.filter(job => job.status === "active").length}
                            </p>
                          </div>
                          <div className="rounded-lg border p-4">
                            <h3 className="text-sm font-medium text-gray-500">Completed Jobs</h3>
                            <p className="mt-2 text-2xl font-bold">
                              {postedJobs.filter(job => job.status === "completed").length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Application Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="rounded-lg border p-4">
                            <h3 className="text-sm font-medium text-gray-500">Total Applications</h3>
                            <p className="mt-2 text-2xl font-bold">
                              {applications.length}
                            </p>
                          </div>
                          <div className="rounded-lg border p-4">
                            <h3 className="text-sm font-medium text-gray-500">Pending Review</h3>
                            <p className="mt-2 text-2xl font-bold">
                              {applications.filter(app => app.status === "pending").length}
                            </p>
                          </div>
                          <div className="rounded-lg border p-4">
                            <h3 className="text-sm font-medium text-gray-500">Accepted Applications</h3>
                            <p className="mt-2 text-2xl font-bold">
                              {applications.filter(app => app.status === "accepted").length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileNav 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        userRole={userRole}
      />

      {showPostJobModal && (
        <PostJobForm onClose={() => setShowPostJobModal(false)} />
      )}

      <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
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
              <div className="flex gap-2 sticky bottom-0 bg-background py-4">
                <Button
                  className="flex-1"
                  onClick={() => {
                    jobsApi.update(selectedJob.id, { ...selectedJob, status: "completed" });
                    setShowJobDetails(false);
                    setSelectedJob(null);
                  }}
                >
                  Mark as Completed
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to delete this job?")) {
                      try {
                        await jobsApi.delete(selectedJob.id);
                        setPostedJobs(postedJobs.filter(job => job.id !== selectedJob.id));
                        setShowJobDetails(false);
                        setSelectedJob(null);
                      } catch (error) {
                        console.error("Error deleting job:", error);
                        alert("Failed to delete job");
                      }
                    }
                  }}
                >
                  Delete Job
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {showProfileModal && (
        userRole === "student" ? (
          <ProfileModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            userData={userData}
            onUpdate={handleProfileUpdate}
          />
        ) : (
          <ProviderProfileModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            userData={userData}
            onUpdate={handleProfileUpdate}
          />
        )
      )}

      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          userData={userData}
          onUpdate={handleSettingsUpdate}
        />
      )}
    </div>
  );
}
