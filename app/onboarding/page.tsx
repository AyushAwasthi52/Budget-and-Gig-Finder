"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, Building, GraduationCap } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

interface FormData {
  email: string;
  password: string;
  name: string;
  skills: string;
  budget: number;
  income: string;
  incomeSources: string[];
  companyName: string;
  companySize: string;
  companyDescription: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
}

const incomeSourceOptions = [
  "Part-time job",
  "Parental support",
  "Financial aid",
  "Scholarships",
] as const;

const jobTypeOptions = [
  "Remote Work",
  "On-site",
  "Part-time",
  "One-time Gigs",
  "Internships",
  "Seasonal",
] as const;

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fromSignup = searchParams.get("from") === "signup";
  const [userRole, setUserRole] = useState<string>(searchParams.get("role") || "student");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    name: "",
    skills: "",
    budget: 10000,
    income: "",
    incomeSources: [],
    companyName: "",
    companySize: "small",
    companyDescription: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    location: ""
  });

  const isFormIncomplete = userRole === "student"
    ? !formData.email || !formData.password || !formData.name || !formData.skills || !formData.income
    : !formData.email || !formData.password || !formData.companyName || !formData.contactName || !formData.contactEmail;

  const handleSubmit = async () => {
    try {
      setError("");
      
      if (isFormIncomplete) {
        setError("Please fill in all required fields");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        return;
      }

      // Password validation
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }

      // Provider-specific validation
      if (userRole === "provider") {
        if (!formData.companyName.trim()) {
          setError("Company name is required");
          return;
        }
        if (!formData.contactName.trim()) {
          setError("Contact name is required");
          return;
        }
        if (!emailRegex.test(formData.contactEmail)) {
          setError("Please enter a valid business email address");
          return;
        }
      }

      try {
        // Create user in Firebase
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Save user data to localStorage
        const userData = {
          ...formData,
          userRole,
          uid: userCredential.user.uid,
          createdAt: new Date().toISOString(),
          // Add provider-specific data
          ...(userRole === "provider" && {
            companyName: formData.companyName.trim(),
            contactName: formData.contactName.trim(),
            contactEmail: formData.contactEmail.trim(),
            contactPhone: formData.contactPhone.trim(),
            companySize: formData.companySize,
            companyDescription: formData.companyDescription.trim(),
            location: formData.location.trim()
          })
        };
        
        localStorage.setItem("userData", JSON.stringify(userData));

        // Redirect based on user role
        if (userRole === "provider") {
          router.push('/dashboard?role=provider');
        } else {
          router.push('/dashboard?role=student');
        }
      } catch (firebaseError: any) {
        console.error("Firebase signup error:", firebaseError);
        
        switch (firebaseError.code) {
          case 'auth/email-already-in-use':
            setError("This email is already registered. Please try logging in instead.");
            break;
          case 'auth/invalid-email':
            setError("Please enter a valid email address.");
            break;
          case 'auth/operation-not-allowed':
            setError("Email/password accounts are not enabled. Please contact support.");
            break;
          case 'auth/weak-password':
            setError("Password is too weak. Please use at least 6 characters.");
            break;
          case 'auth/network-request-failed':
            setError("Network error. Please check your internet connection.");
            break;
          default:
            setError(`Registration failed: ${firebaseError.message || 'Please try again.'}`);
        }
      }
    } catch (error: any) {
      console.error("General signup error:", error);
      setError(error.message || "An unexpected error occurred. Please try again.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(""); // Clear error when user types
  };

  const handleIncomeSourceToggle = (source: string) => {
    setFormData(prev => {
      const isChecked = prev.incomeSources.includes(source);
      return {
        ...prev,
        incomeSources: isChecked
          ? prev.incomeSources.filter(s => s !== source)
          : [...prev.incomeSources, source]
      };
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {userRole === "student" ? (
              <GraduationCap className="h-5 w-5 text-purple-600" />
            ) : (
              <Building className="h-5 w-5 text-purple-600" />
            )}
            <h2 className="text-lg font-semibold">
              {fromSignup ? "Choose Your Role" : userRole === "student" ? "Student Onboarding" : "Job Provider Onboarding"}
            </h2>
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {fromSignup ? "Select Your Account Type" : userRole === "student" ? "Complete Your Profile" : "Company Information"}
            </CardTitle>
            <CardDescription>
              {fromSignup 
                ? "Choose how you want to use Budget & Gig Finder"
                : userRole === "student"
                  ? "Tell us about yourself and your preferences"
                  : "Tell us about your organization"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {fromSignup && (
              <>
                <RadioGroup
                  value={userRole}
                  onValueChange={(value: string) => setUserRole(value)}
                >
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-start space-x-3 rounded-lg border p-4">
                      <RadioGroupItem value="student" id="student" className="mt-1" />
                      <div>
                        <Label htmlFor="student" className="text-base font-medium">
                          I'm a Student
                        </Label>
                        <p className="text-sm text-gray-500">
                          Looking for part-time jobs, gigs, and budget management tools
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 rounded-lg border p-4">
                      <RadioGroupItem value="provider" id="provider" className="mt-1" />
                      <div>
                        <Label htmlFor="provider" className="text-base font-medium">
                          I'm a Job Provider
                        </Label>
                        <p className="text-sm text-gray-500">
                          Offering part-time jobs and gigs for college students
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
                <Button 
                  className="w-full" 
                  onClick={() => router.push(`/onboarding?role=${userRole}`)}
                >
                  Continue
                </Button>
                <Separator />
              </>
            )}

            {!fromSignup && (
              <>
                {error && (
                  <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a password"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 6 characters long
                    </p>
                  </div>
                </div>

                <Separator />

                {userRole === "student" ? (
                  <>
                    <div>
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="skills">Your Skills</Label>
                      <Input
                        id="skills"
                        name="skills"
                        value={formData.skills}
                        onChange={handleInputChange}
                        placeholder="Eg: Writing, Design, Programming..."
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="monthly-income">Monthly Income</Label>
                      <Input
                        id="monthly-income"
                        name="income"
                        value={formData.income}
                        onChange={handleInputChange}
                        placeholder="₹5000"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Income Sources</Label>
                      {incomeSourceOptions.map((source) => (
                        <div key={source} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={source}
                            checked={formData.incomeSources.includes(source)}
                            onChange={() => handleIncomeSourceToggle(source)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Label htmlFor={source} className="text-sm font-normal">
                            {source}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="Enter your company name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact-name">Primary Contact Name</Label>
                      <Input
                        id="contact-name"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        placeholder="Jane Smith"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact-email">Business Email</Label>
                      <Input
                        id="contact-email"
                        name="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        placeholder="contact@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Types of Jobs You Typically Offer</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {jobTypeOptions.map((jobType) => (
                          <div key={jobType} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={jobType}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor={jobType} className="text-sm font-normal">
                              {jobType}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>

          {!fromSignup && (
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleSubmit}
                disabled={isFormIncomplete}
              >
                Complete Setup
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
