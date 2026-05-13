import { NextRequest, NextResponse } from 'next/server';
import { getNews, getDb } from '@/lib/db';

export async function GET() {
  try {
    const news = await getNews();
    return NextResponse.json(news);
  } catch (err) {
    console.error('Failed to read news:', err);
    return NextResponse.json({ error: 'Failed to read news' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, date, image } = await req.json();
    const db = getDb();
    
    const result = await db.news.create({
      data: { title, description, date, image },
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('Failed to add news:', err);
    return NextResponse.json({ error: 'Failed to add news' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, title, description, date, image } = await req.json();
    const db = getDb();
    
    const result = await db.news.update({
      where: { id },
      data: { title, description, date, image },
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('Failed to update news:', err);
    return NextResponse.json({ error: 'Failed to update news' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const db = getDb();
    
    await db.news.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete news:', err);
    return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 });
  }
}
