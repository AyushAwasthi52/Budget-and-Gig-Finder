import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';

// Get user settings
export async function GET(request: Request) {
  try {
    const user = auth.currentUser;
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const settings = localStorage.getItem(`settings_${user.uid}`);
    return NextResponse.json(settings ? JSON.parse(settings) : {
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
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// Update user settings
export async function PUT(request: Request) {
  try {
    const user = auth.currentUser;
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data = await request.json();
    localStorage.setItem(`settings_${user.uid}`, JSON.stringify(data));
    
    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
} 