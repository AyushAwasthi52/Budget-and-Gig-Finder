import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, image } = body

    if (!email || typeof email !== "string") {
      return new NextResponse("Valid email is required", { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ user: existingUser, message: "User already exists" })
    }

    const newUser = await prisma.user.create({
      data: {
        name: typeof name === "string" ? name : null,
        email,
        image: typeof image === "string" ? image : null,
      },
    })

    return NextResponse.json({ user: newUser, message: "User created" })
  } catch (error) {
    console.error("User creation error:", error)
    return new NextResponse(`Error creating user: ${error instanceof Error ? error.message : String(error)}`, {
      status: 500,
    })
  }
}
