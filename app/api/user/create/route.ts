import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, image } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ user: existingUser, message: "User already exists" })
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        image: image || null,
        role: "USER", // optional, if you have roles
      },
    })

    return NextResponse.json({ user: newUser, message: "User created" })
  } catch (error) {
    console.error("User creation error:", error)
    return new NextResponse("Error creating user", { status: 500 })
  }
}
