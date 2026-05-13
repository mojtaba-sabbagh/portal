import { NextRequest, NextResponse } from 'next/server';
import { reorderNews } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const items = await req.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    await reorderNews(items);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving reordered news:', error);
    return NextResponse.json({ error: 'Failed to save new order' }, { status: 500 });
  }
}
