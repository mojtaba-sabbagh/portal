import { NextRequest, NextResponse } from 'next/server';
import { getVideos, getDb } from '@/lib/db';

export async function GET() {
  try {
    const data = await getVideos();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error reading videos:', err);
    return NextResponse.json({ error: 'Failed to load videos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { category, label, src } = await req.json();
    const db = getDb();
    
    const result = await db.video.create({
      data: { category, label, src },
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('Error adding video:', err);
    return NextResponse.json({ error: 'Failed to add video' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, category, label, src } = await req.json();
    const db = getDb();
    
    const result = await db.video.update({
      where: { id },
      data: { category, label, src },
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('Error updating video:', err);
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const db = getDb();
    
    await db.video.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting video:', err);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}
