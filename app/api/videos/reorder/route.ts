import { NextRequest, NextResponse } from 'next/server';
import { reorderVideos } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const items = await req.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid format: expected an array' }, { status: 400 });
    }

    await reorderVideos(items);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error saving reordered videos:', err);
    return NextResponse.json({ error: 'Failed to save reorder' }, { status: 500 });
  }
}
