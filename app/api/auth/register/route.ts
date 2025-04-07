// app/api/auth/register/route.ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { name, email, password, role } = await req.json();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return NextResponse.json({ error: 'User already exists' }, { status: 400 });

  const hashed = await hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role },
  });

  return NextResponse.json({ user: { id: user.id, email: user.email } });
}
