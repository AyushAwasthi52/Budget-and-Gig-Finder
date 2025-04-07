import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';

// Get gigs with optional filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || '';

    // In production, this would be fetched from a database
    const gigs = localStorage.getItem('gigs') || '[]';
    let filteredGigs = JSON.parse(gigs);

    if (search) {
      filteredGigs = filteredGigs.filter((gig: any) => 
        gig.title.toLowerCase().includes(search.toLowerCase()) ||
        gig.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filter) {
      filteredGigs = filteredGigs.filter((gig: any) => 
        gig.type === filter || gig.location === filter
      );
    }

    return NextResponse.json(filteredGigs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch gigs' }, { status: 500 });
  }
}

// Create a new gig
export async function POST(request: Request) {
  try {
    const user = auth.currentUser;
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data = await request.json();
    const gigs = JSON.parse(localStorage.getItem('gigs') || '[]');
    
    const newGig = {
      id: Date.now().toString(),
      userId: user.uid,
      createdAt: new Date().toISOString(),
      status: 'active',
      ...data
    };

    gigs.push(newGig);
    localStorage.setItem('gigs', JSON.stringify(gigs));

    return NextResponse.json(newGig);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create gig' }, { status: 500 });
  }
}

// Update a gig
export async function PUT(request: Request) {
  try {
    const user = auth.currentUser;
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data = await request.json();
    const { id } = data;

    const gigs = JSON.parse(localStorage.getItem('gigs') || '[]');
    const gigIndex = gigs.findIndex((gig: any) => gig.id === id && gig.userId === user.uid);

    if (gigIndex === -1) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    }

    gigs[gigIndex] = { ...gigs[gigIndex], ...data };
    localStorage.setItem('gigs', JSON.stringify(gigs));

    return NextResponse.json(gigs[gigIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update gig' }, { status: 500 });
  }
}

// Delete a gig
export async function DELETE(request: Request) {
  try {
    const user = auth.currentUser;
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Gig ID required' }, { status: 400 });
    }

    const gigs = JSON.parse(localStorage.getItem('gigs') || '[]');
    const gigIndex = gigs.findIndex((gig: any) => gig.id === id && gig.userId === user.uid);

    if (gigIndex === -1) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    }

    gigs.splice(gigIndex, 1);
    localStorage.setItem('gigs', JSON.stringify(gigs));

    return NextResponse.json({ message: 'Gig deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete gig' }, { status: 500 });
  }
} 