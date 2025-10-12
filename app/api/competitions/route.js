import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const competitions = [
      { id: 'FLAG_TWIRLING', name: 'FLAG_TWIRLING', displayName: 'Flag Twirling' },
      { id: 'PAGEANTRY', name: 'PAGEANTRY', displayName: 'Pageantry' },
      { id: 'HIPHOP', name: 'HIPHOP', displayName: 'Hiphop' },
      { id: 'SINGING', name: 'SINGING', displayName: 'Singing' },
      { id: 'BENCH_CHEERING', name: 'BENCH_CHEERING', displayName: 'Bench Cheering' },
      { id: 'LITTLE_LYCEAN_STARS', name: 'LITTLE_LYCEAN_STARS', displayName: 'Little Lycean Star' },
      { id: 'LYCEAN_TEEN_MODEL', name: 'LYCEAN_TEEN_MODEL', displayName: 'Lycean Teen Model' }
    ]

    return NextResponse.json({ success: true, competitions })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch competitions' }, { status: 500 })
  }
}
