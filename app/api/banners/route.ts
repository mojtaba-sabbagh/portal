import { NextRequest, NextResponse } from 'next/server';
import { getBanners, getDb } from '@/lib/db';

export async function GET() {
  try {
    const banners = await getBanners();
    return NextResponse.json(banners);
  } catch (err) {
    console.error("API ERROR:", err);
    return NextResponse.json({ error: 'Failed to load banners' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, image, link } = await req.json();
    const db = getDb();
    
    const result = await db.banner.create({
      data: { title, image, link },
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("API ERROR:", err);
    return NextResponse.json({ error: 'Failed to add banner' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, title, image, link } = await req.json();
    const db = getDb();
    
    const result = await db.banner.update({
      where: { id },
      data: { title, image, link },
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("API ERROR:", err);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const db = getDb();
    
    await db.banner.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API ERROR:", err);
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
