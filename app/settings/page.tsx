"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Bell, Moon, Sun, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { MobileNav } from "@/components/mobile-nav";
import { settingsApi } from "@/lib/api";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

interface Settings {
  darkMode: boolean;
  notifications: boolean;
  budgetAlerts: boolean;
  weeklyReports: boolean;
  budgetResetSchedule: 'weekly' | 'monthly' | 'semester';
  gigAlerts: boolean;
  applicationReminders: boolean;
  autoPublish: boolean;
  resumeRequired: boolean;
  autoResponse: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userRole, setUserRole] = useState<string>("student");
  const [settings, setSettings] = useState<Settings>({
    darkMode: false,
    notifications: true,
    budgetAlerts: true,
    weeklyReports: true,
    budgetResetSchedule: 'monthly',
    gigAlerts: true,
    applicationReminders: true,
    autoPublish: true,
    resumeRequired: true,
    autoResponse: true
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const role = searchParams.get("role") || "student";
    setUserRole(role);

    const fetchSettings = async () => {
      try {
        const data = await settingsApi.get();
        setSettings(data);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [searchParams]);

  const handleSettingChange = async (key: keyof Settings, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value };
      await settingsApi.update(newSettings);
      setSettings(newSettings);

      // Apply dark mode immediately
      if (key === 'darkMode') {
        document.documentElement.classList.toggle('dark', value);
      }
    } catch (error) {
      console.error("Failed to update setting:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (isLoading) {
    return <p className="p-6 text-center text-gray-500">Loading settings...</p>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-purple-700">Settings</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Budget Preferences</CardTitle>
              <CardDescription>Customize your budget settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="budget-alerts">Budget Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified when you're close to your budget limit</p>
                </div>
                <Switch 
                  id="budget-alerts" 
                  checked={settings.budgetAlerts}
                  onCheckedChange={(checked) => handleSettingChange('budgetAlerts', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-reports">Weekly Reports</Label>
                  <p className="text-sm text-gray-500">Receive weekly spending summaries</p>
                </div>
                <Switch 
                  id="weekly-reports" 
                  checked={settings.weeklyReports}
                  onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Budget Reset Schedule</Label>
                <RadioGroup 
                  value={settings.budgetResetSchedule}
                  onValueChange={(value) => handleSettingChange('budgetResetSchedule', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly" className="text-sm font-normal">Weekly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly" className="text-sm font-normal">Monthly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="semester" id="semester" />
                    <Label htmlFor="semester" className="text-sm font-normal">By Semester</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Gig Preferences</CardTitle>
              <CardDescription>Customize your gig notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="gig-alerts">Gig Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified about new gigs that match your preferences</p>
                </div>
                <Switch 
                  id="gig-alerts" 
                  checked={settings.gigAlerts}
                  onCheckedChange={(checked) => handleSettingChange('gigAlerts', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="application-reminders">Application Reminders</Label>
                  <p className="text-sm text-gray-500">Receive reminders about pending applications</p>
                </div>
                <Switch 
                  id="application-reminders" 
                  checked={settings.applicationReminders}
                  onCheckedChange={(checked) => handleSettingChange('applicationReminders', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {userRole === "provider" && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Job Posting Preferences</CardTitle>
                <CardDescription>Customize your job posting settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-publish">Auto-Publish Jobs</Label>
                    <p className="text-sm text-gray-500">Automatically publish new job postings</p>
                  </div>
                  <Switch 
                    id="auto-publish" 
                    checked={settings.autoPublish}
                    onCheckedChange={(checked) => handleSettingChange('autoPublish', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="resume-required">Require Resume</Label>
                    <p className="text-sm text-gray-500">Require applicants to upload a resume</p>
                  </div>
                  <Switch 
                    id="resume-required" 
                    checked={settings.resumeRequired}
                    onCheckedChange={(checked) => handleSettingChange('resumeRequired', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-response">Automatic Response</Label>
                    <p className="text-sm text-gray-500">Send an automatic response to applicants</p>
                  </div>
                  <Switch 
                    id="auto-response" 
                    checked={settings.autoResponse}
                    onCheckedChange={(checked) => handleSettingChange('autoResponse', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Account</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-gray-500">Switch between light and dark themes</p>
                </div>
                <Switch 
                  id="dark-mode" 
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Enable or disable push notifications</p>
                </div>
                <Switch 
                  id="notifications" 
                  checked={settings.notifications}
                  onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      <MobileNav activeTab="settings" setActiveTab={() => {}} userRole={userRole} />
    </div>
  );
} 