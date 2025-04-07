import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  Query,
  DocumentData
} from "firebase/firestore";
import { auth } from "./firebase";

interface JobData {
  id: string;
  title: string;
  description: string;
  budget: number;
  type: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  requirements: string;
  deadline: string;
  createdAt: string;
  status: string;
}

export interface Notification {
  id: string;
  type: "application_reviewed" | "application_accepted" | "application_rejected" | "new_application" | "job_completed" | "new_job";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  jobId?: string;
  applicationId?: string;
  userId: string;
}

const NOTIFICATIONS_KEY = "notifications";
const SETTINGS_KEY = "user_settings";

// API utility functions
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`/api/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

// User API
export const userApi = {
  get: async () => {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      throw new Error("No user data found");
    }
    return JSON.parse(userData);
  },

  update: async (data: any) => {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      throw new Error("No user data found");
    }
    const updatedData = { ...JSON.parse(userData), ...data };
    localStorage.setItem("userData", JSON.stringify(updatedData));
    return updatedData;
  }
};

// Settings API
export const settingsApi = {
  get: async () => {
    const settings = localStorage.getItem(SETTINGS_KEY);
    return settings ? JSON.parse(settings) : null;
  },

  update: async (settings: any) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return settings;
  },

  reset: async () => {
    localStorage.removeItem(SETTINGS_KEY);
  },
};

// Gigs API calls
export const gigsApi = {
  get: (search?: string, filter?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (filter) params.append('filter', filter);
    return fetchApi(`gigs?${params.toString()}`);
  },
  create: (data: any) => fetchApi('gigs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (data: any) => fetchApi('gigs', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchApi(`gigs?id=${id}`, {
    method: 'DELETE',
  }),
};

// Jobs API
export const jobsApi = {
  getAll: async (filters: { search?: string; type?: string; location?: string; status?: string } = {}) => {
    try {
      const jobs = localStorage.getItem("jobs");
      console.log("Raw jobs from localStorage:", jobs);
      
      if (!jobs) {
        console.log("No jobs found in localStorage");
        return [];
      }

      let allJobs = JSON.parse(jobs);
      console.log("Parsed jobs:", allJobs);

      // Apply filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        allJobs = allJobs.filter((job: any) =>
          job.title.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower) ||
          job.companyName.toLowerCase().includes(searchLower)
        );
      }

      if (filters.type) {
        allJobs = allJobs.filter((job: any) => job.type === filters.type);
      }

      if (filters.location) {
        allJobs = allJobs.filter((job: any) => job.location === filters.location);
      }

      if (filters.status) {
        allJobs = allJobs.filter((job: any) => job.status === filters.status);
      }

      console.log("Filtered jobs:", allJobs);
      return allJobs;
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }
  },

  create: async (jobData: any) => {
    try {
      const jobs = localStorage.getItem("jobs");
      console.log("Current jobs before create:", jobs);
      
      const allJobs = jobs ? JSON.parse(jobs) : [];
      
      // Get coordinates from location using OpenStreetMap's Nominatim API
      let coordinates;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(jobData.location)}`
        );
        const data = await response.json();
        if (data && data[0]) {
          coordinates = {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          };
        }
      } catch (error) {
        console.error("Error getting coordinates:", error);
      }
      
      const newJob = {
        ...jobData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: "active",
        applications: [],
        coordinates
      };

      console.log("New job to be added:", newJob);
      allJobs.push(newJob);
      localStorage.setItem("jobs", JSON.stringify(allJobs));
      console.log("Updated jobs in localStorage:", localStorage.getItem("jobs"));
      return newJob;
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    }
  },

  update: async (jobId: string, updates: any) => {
    try {
      const jobs = localStorage.getItem("jobs");
      if (!jobs) {
        throw new Error("No jobs found");
      }

      const allJobs = JSON.parse(jobs);
      const jobIndex = allJobs.findIndex((job: any) => job.id === jobId);

      if (jobIndex === -1) {
        throw new Error("Job not found");
      }

      allJobs[jobIndex] = { ...allJobs[jobIndex], ...updates };
      localStorage.setItem("jobs", JSON.stringify(allJobs));
      return allJobs[jobIndex];
    } catch (error) {
      console.error("Error updating job:", error);
      throw error;
    }
  },

  delete: async (jobId: string) => {
    try {
      const jobs = localStorage.getItem("jobs");
      if (!jobs) {
        throw new Error("No jobs found");
      }

      const allJobs = JSON.parse(jobs);
      const filteredJobs = allJobs.filter((job: any) => job.id !== jobId);
      localStorage.setItem("jobs", JSON.stringify(filteredJobs));
      return true;
    } catch (error) {
      console.error("Error deleting job:", error);
      throw error;
    }
  },

  apply: async (jobId: string, userId: string, applicationData: any) => {
    try {
      const jobs = localStorage.getItem("jobs");
      if (!jobs) {
        throw new Error("No jobs found");
      }

      const allJobs = JSON.parse(jobs);
      const jobIndex = allJobs.findIndex((job: any) => job.id === jobId);

      if (jobIndex === -1) {
        throw new Error("Job not found");
      }

      const job = allJobs[jobIndex];
      if (!job.applications) {
        job.applications = [];
      }

      job.applications.push({
        userId,
        ...applicationData,
        appliedAt: new Date().toISOString()
      });

      localStorage.setItem("jobs", JSON.stringify(allJobs));
      return job;
    } catch (error) {
      console.error("Error applying to job:", error);
      throw error;
    }
  }
};

// Applications API
export const applicationsApi = {
  getAll: async () => {
    const applications = localStorage.getItem("applications");
    if (!applications) {
      return [];
    }
    return JSON.parse(applications);
  },

  create: async (data: any) => {
    const applications = localStorage.getItem("applications");
    const currentApplications = applications ? JSON.parse(applications) : [];
    const newApplication = { ...data, id: Date.now().toString() };
    currentApplications.push(newApplication);
    localStorage.setItem("applications", JSON.stringify(currentApplications));
    return newApplication;
  },

  update: async (id: string, data: any) => {
    const applications = localStorage.getItem("applications");
    if (!applications) {
      throw new Error("No applications found");
    }
    const currentApplications = JSON.parse(applications);
    const updatedApplications = currentApplications.map((app: any) =>
      app.id === id ? { ...app, ...data } : app
    );
    localStorage.setItem("applications", JSON.stringify(updatedApplications));
    return updatedApplications.find((app: any) => app.id === id);
  },

  delete: async (id: string) => {
    const applications = localStorage.getItem("applications");
    if (!applications) {
      throw new Error("No applications found");
    }
    const currentApplications = JSON.parse(applications);
    const updatedApplications = currentApplications.filter((app: any) => app.id !== id);
    localStorage.setItem("applications", JSON.stringify(updatedApplications));
  }
};

export const notificationsApi = {
  getAll: async (userId?: string): Promise<Notification[]> => {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifications = stored ? JSON.parse(stored) : [];
    
    // Filter notifications for the specific user or show all notifications for "all" userId
    return notifications.filter((n: Notification) => 
      !userId || n.userId === userId || n.userId === "all"
    );
  },

  create: async (notification: Omit<Notification, "id" | "timestamp" | "read">): Promise<Notification> => {
    const notifications = await notificationsApi.getAll();
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([...notifications, newNotification]));
    return newNotification;
  },

  markAsRead: async (id: string): Promise<void> => {
    const notifications = await notificationsApi.getAll();
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  },

  markAllAsRead: async (): Promise<void> => {
    const notifications = await notificationsApi.getAll();
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  },

  delete: async (id: string): Promise<void> => {
    const notifications = await notificationsApi.getAll();
    const filtered = notifications.filter(n => n.id !== id);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered));
  },
}; 