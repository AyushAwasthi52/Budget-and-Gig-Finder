import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-purple-500 to-indigo-700">
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="space-y-6 w-full max-w-md">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl">Budget & Gig Finder</h1>
            <p className="text-xl text-white/90">Connect students with flexible side gigs</p>
          </div>

          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/20 text-white">
              <TabsTrigger value="student" className="data-[state=active]:bg-white data-[state=active]:text-purple-700">
                I'm a Student
              </TabsTrigger>
              <TabsTrigger
                value="provider"
                className="data-[state=active]:bg-white data-[state=active]:text-purple-700"
              >
                I'm a Job Provider
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="mt-4 space-y-4">
              <div className="text-white text-left space-y-2">
                <h3 className="font-medium text-lg">For Students:</h3>
                <ul className="list-disc pl-5 text-sm">
                  <li>Find flexible part-time jobs that fit your schedule</li>
                  <li>Manage your budget and track expenses</li>
                  <li>Build your resume with relevant experience</li>
                </ul>
              </div>
              <div className="space-y-4">
                <Link href="/login?role=student">
                  <Button size="lg" className="w-full bg-white text-purple-700 hover:bg-white/90">
                    Log In as Student
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="provider" className="mt-4 space-y-4">
              <div className="text-white text-left space-y-2">
                <h3 className="font-medium text-lg">For Job Providers:</h3>
                <ul className="list-disc pl-5 text-sm">
                  <li>Post part-time jobs and gigs for college students</li>
                  <li>Find qualified candidates quickly</li>
                  <li>Manage applications and communicate with applicants</li>
                </ul>
              </div>
              <div className="space-y-4">
                <Link href="/login?role=provider">
                  <Button size="lg" className="w-full bg-white text-purple-700 hover:bg-white/90">
                    Log In as Provider
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>

          <p className="text-sm text-white/80">Connecting college students with flexible opportunities</p>
        </div>
      </div>
    </div>
  )
}

