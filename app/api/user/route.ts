import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';

// Get user profile
export async function GET(request: Request) {
  try {
    const user = auth.currentUser;
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user data from localStorage (in production, this would be from a database)
    const userData = localStorage.getItem(`userData_${user.uid}`);
    return NextResponse.json(userData ? JSON.parse(userData) : {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// Update user profile
export async function PUT(request: Request) {
  try {
    const user = auth.currentUser;
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data = await request.json();
    // Save to localStorage (in production, this would be to a database)
    localStorage.setItem(`userData_${user.uid}`, JSON.stringify(data));
    
    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
} 