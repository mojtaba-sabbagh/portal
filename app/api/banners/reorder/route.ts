import { NextRequest, NextResponse } from 'next/server';
import { reorderBanners } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const items = await req.json();
    if (!Array.isArray(items)) throw new Error("Invalid data");

    await reorderBanners(items);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API ERROR:", err);
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
  }
}
