import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const competitions = [
      { id: 'FLAG_TWIRLING', name: 'FLAG_TWIRLING', displayName: 'Flag Twirling' },
      { id: 'PAGEANTRY', name: 'PAGEANTRY', displayName: 'Pageantry' },
      { id: 'HIPHOP', name: 'HIPHOP', displayName: 'Hiphop' },
      { id: 'SINGING', name: 'SINGING', displayName: 'Singing' }
    ]

    return NextResponse.json({ success: true, competitions })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch competitions' }, { status: 500 })
  }
}
