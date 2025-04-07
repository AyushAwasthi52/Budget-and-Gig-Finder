"use client";

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth"
import { auth, provider } from "@/lib/firebase"

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'student'

  // Load saved email if it exists
  useEffect(() => {
    const savedEmail = localStorage.getItem('lastUsedEmail')
    if (savedEmail) {
      setEmail(savedEmail)
    }
  }, [])

  const saveUserData = (userEmail: string, userRole: string) => {
    localStorage.setItem('lastUsedEmail', userEmail)
    localStorage.setItem('userRole', userRole)
    localStorage.setItem('lastLoginTime', new Date().toISOString())
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      if (user) {
        saveUserData(email, role)
        router.push(`/dashboard?role=${role}`)
      }
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password')
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address')
      } else {
        setError('An error occurred during login. Please try again.')
      }
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      console.log('Firebase user:', user)

      // Save Google user data
      if (user.email) {
        saveUserData(user.email, role)
      }

      router.push(`/dashboard?role=${role}`)
    } catch (error) {
      console.error('Google sign-in error:', error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="mb-6 flex items-center text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to home
        </Link>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Log in as {role === 'student' ? 'Student' : 'Job Provider'}</CardTitle>
            <CardDescription>
              {localStorage.getItem('lastUsedEmail') 
                ? `Welcome back! Last login: ${new Date(localStorage.getItem('lastLoginTime') || '').toLocaleDateString()}`
                : 'Enter your email and password to access your account'
              }
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="grid gap-4">
              <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin}>
                Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-50 px-2 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-500 text-center">
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => {
                    setError('')
                    setEmail(e.target.value)
                  }}
                  required
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="text-xs text-gray-500 hover:text-gray-900"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setError('')
                    setPassword(e.target.value)
                  }}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col">
              <Button type="submit" className="w-full">
                Log In
              </Button>
              <p className="mt-4 text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link
                  href={`/onboarding?from=signup`}
                  className="text-purple-600 hover:text-purple-500"
                >
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
