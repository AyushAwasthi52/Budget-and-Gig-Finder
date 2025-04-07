"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Camera, Edit, LogOut, Save, User, Building, Briefcase, GraduationCap, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { MobileNav } from "@/components/mobile-nav"
import { profileApi } from "@/lib/api"

export default function ProfilePage() {
  const searchParams = useSearchParams()
  const [userRole, setUserRole] = useState<string>("student")
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const role = searchParams.get("role") || "student"
    setUserRole(role)
    
    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        const data = await profileApi.get();
        if (role === "student") {
          setStudentData(data);
        } else {
          setProviderData(data);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, [searchParams])

  // Mock user data for student
  const [studentData, setStudentData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@university.edu",
    phone: "(555) 123-4567",
    university: "State University",
    major: "Computer Science",
    graduationYear: "2025",
    profileImage: "/placeholder.svg?height=100&width=100",
    resume: null,
  })

  // Mock user data for provider
  const [providerData, setProviderData] = useState({
    name: "Jane Smith",
    email: "jane.smith@acmeinc.com",
    phone: "(555) 987-6543",
    company: "Acme Inc.",
    position: "Hiring Manager",
    website: "www.acmeinc.com",
    profileImage: "/placeholder.svg?height=100&width=100",
    companyDescription: "Acme Inc. is a technology company specializing in software solutions for small businesses.",
  })

  const handleSaveProfile = async () => {
    try {
      const profileData = userRole === "student" ? studentData : providerData;
      await profileApi.update(profileData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
      // You might want to show an error toast here
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Mobile Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4">
        <div className="flex items-center">
          <Link href={`/dashboard?role=${userRole}`} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold text-purple-700">
            {userRole === "student" ? "Student Profile" : "Company Profile"}
          </h1>
        </div>
        {isEditing ? (
          <Button size="sm" onClick={handleSaveProfile}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <Link href={`/settings?role=${userRole}`}>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </Link>
          </TabsList>

          {userRole === "student" ? (
            <>
              <TabsContent value="profile" className="space-y-4">
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="relative mb-4">
                    <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-200">
                      {studentData.profileImage ? (
                        <img
                          src={studentData.profileImage || "/placeholder.svg"}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-full w-full p-4 text-gray-400" />
                      )}
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 rounded-full bg-purple-600 p-2 text-white shadow-lg">
                        <Camera className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <h2 className="text-xl font-bold">{studentData.name}</h2>
                  <p className="text-sm text-gray-500">{studentData.university}</p>
                  <div className="mt-2 flex items-center">
                    <GraduationCap className="mr-1 h-4 w-4 text-purple-600" />
                    <span className="text-sm">Student</span>
                  </div>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                    <CardDescription>Your basic information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={studentData.name}
                        onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={studentData.email}
                        onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={studentData.phone}
                        onChange={(e) => setStudentData({ ...studentData, phone: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Academic Information</CardTitle>
                    <CardDescription>Your university details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="university">University</Label>
                      <Input
                        id="university"
                        value={studentData.university}
                        onChange={(e) => setStudentData({ ...studentData, university: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="major">Major</Label>
                      <Input
                        id="major"
                        value={studentData.major}
                        onChange={(e) => setStudentData({ ...studentData, major: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="graduationYear">Expected Graduation Year</Label>
                      <Input
                        id="graduationYear"
                        value={studentData.graduationYear}
                        onChange={(e) => setStudentData({ ...studentData, graduationYear: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Resume & Skills</CardTitle>
                    <CardDescription>Showcase your experience to employers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Resume</Label>
                      {studentData.resume ? (
                        <div className="flex items-center justify-between rounded-md border border-gray-200 p-3">
                          <div className="flex items-center">
                            <FileText className="mr-2 h-5 w-5 text-gray-500" />
                            <span>resume.pdf</span>
                          </div>
                          {isEditing && (
                            <Button variant="ghost" size="sm" className="text-red-500">
                              Remove
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-md border border-dashed border-gray-300 p-6 text-center">
                          <p className="text-sm text-gray-500">Upload your resume to apply for jobs faster</p>
                          {isEditing && (
                            <Button className="mt-2" size="sm">
                              Upload Resume
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Skills</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="writing-skill"
                            className="h-4 w-4 rounded border-gray-300"
                            checked
                            disabled={!isEditing}
                          />
                          <Label htmlFor="writing-skill" className="text-sm font-normal">
                            Writing
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="design-skill"
                            className="h-4 w-4 rounded border-gray-300"
                            disabled={!isEditing}
                          />
                          <Label htmlFor="design-skill" className="text-sm font-normal">
                            Graphic Design
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="programming-skill"
                            className="h-4 w-4 rounded border-gray-300"
                            checked
                            disabled={!isEditing}
                          />
                          <Label htmlFor="programming-skill" className="text-sm font-normal">
                            Programming
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="customer-service-skill"
                            className="h-4 w-4 rounded border-gray-300"
                            disabled={!isEditing}
                          />
                          <Label htmlFor="customer-service-skill" className="text-sm font-normal">
                            Customer Service
                          </Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
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
                      <Switch id="budget-alerts" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="weekly-reports">Weekly Reports</Label>
                        <p className="text-sm text-gray-500">Receive weekly spending summaries</p>
                      </div>
                      <Switch id="weekly-reports" defaultChecked />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Budget Reset Schedule</Label>
                      <RadioGroup defaultValue="monthly">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="weekly" id="weekly" />
                          <Label htmlFor="weekly" className="text-sm font-normal">
                            Weekly
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="monthly" id="monthly" />
                          <Label htmlFor="monthly" className="text-sm font-normal">
                            Monthly
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="semester" id="semester" />
                          <Label htmlFor="semester" className="text-sm font-normal">
                            By Semester
                          </Label>
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
                      <Switch id="gig-alerts" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="application-reminders">Application Reminders</Label>
                        <p className="text-sm text-gray-500">Receive reminders about pending applications</p>
                      </div>
                      <Switch id="application-reminders" defaultChecked />
                    </div>
                  </CardContent>
                </Card>

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
                      <Switch id="dark-mode" />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications">Push Notifications</Label>
                        <p className="text-sm text-gray-500">Enable or disable push notifications</p>
                      </div>
                      <Switch id="notifications" defaultChecked />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="destructive" className="w-full">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </>
          ) : (
            <>
              <TabsContent value="profile" className="space-y-4">
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="relative mb-4">
                    <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-200">
                      {providerData.profileImage ? (
                        <img
                          src={providerData.profileImage || "/placeholder.svg"}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building className="h-full w-full p-4 text-gray-400" />
                      )}
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 rounded-full bg-purple-600 p-2 text-white shadow-lg">
                        <Camera className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <h2 className="text-xl font-bold">{providerData.company}</h2>
                  <p className="text-sm text-gray-500">{providerData.website}</p>
                  <div className="mt-2 flex items-center">
                    <Briefcase className="mr-1 h-4 w-4 text-purple-600" />
                    <span className="text-sm">Job Provider</span>
                  </div>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Company Information</CardTitle>
                    <CardDescription>Your organization details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        value={providerData.company}
                        onChange={(e) => setProviderData({ ...providerData, company: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={providerData.website}
                        onChange={(e) => setProviderData({ ...providerData, website: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyDescription">Company Description</Label>
                      <Textarea
                        id="companyDescription"
                        value={providerData.companyDescription}
                        onChange={(e) => setProviderData({ ...providerData, companyDescription: e.target.value })}
                        disabled={!isEditing}
                        className="min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                    <CardDescription>Your contact details for job seekers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Name</Label>
                      <Input
                        id="contactName"
                        value={providerData.name}
                        onChange={(e) => setProviderData({ ...providerData, name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={providerData.position}
                        onChange={(e) => setProviderData({ ...providerData, position: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={providerData.email}
                        onChange={(e) => setProviderData({ ...providerData, email: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone</Label>
                      <Input
                        id="contactPhone"
                        value={providerData.phone}
                        onChange={(e) => setProviderData({ ...providerData, phone: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
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
                      <Switch id="auto-publish" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="application-notifications">Application Notifications</Label>
                        <p className="text-sm text-gray-500">Get notified when someone applies to your job</p>
                      </div>
                      <Switch id="application-notifications" defaultChecked />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Default Job Visibility</Label>
                      <RadioGroup defaultValue="public">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="public" id="public" />
                          <Label htmlFor="public" className="text-sm font-normal">
                            Public (visible to all students)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="invite" id="invite" />
                          <Label htmlFor="invite" className="text-sm font-normal">
                            Invite Only (only visible with direct link)
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Applicant Preferences</CardTitle>
                    <CardDescription>Customize how you review applicants</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="resume-required">Require Resume</Label>
                        <p className="text-sm text-gray-500">Require applicants to upload a resume</p>
                      </div>
                      <Switch id="resume-required" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-response">Automatic Response</Label>
                        <p className="text-sm text-gray-500">Send an automatic response to applicants</p>
                      </div>
                      <Switch id="auto-response" defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Account</CardTitle>
                    <CardDescription>Manage your account settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="dark-mode-provider">Dark Mode</Label>
                        <p className="text-sm text-gray-500">Switch between light and dark themes</p>
                      </div>
                      <Switch id="dark-mode-provider" />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications-provider">Push Notifications</Label>
                        <p className="text-sm text-gray-500">Enable or disable push notifications</p>
                      </div>
                      <Switch id="notifications-provider" defaultChecked />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="destructive" className="w-full">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>

      {/* Mobile Navigation */}
      <MobileNav activeTab="profile" setActiveTab={setActiveTab} userRole={userRole} />
    </div>
  )
}

