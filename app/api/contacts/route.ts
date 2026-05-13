import { NextRequest, NextResponse } from 'next/server';
import { getContacts, getDb } from '@/lib/db';

export async function GET() {

  console.log('DATABASE_URL exists?', !!process.env.DATABASE_URL);
  try {
    const data = await getContacts();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Failed to read contacts:', err);
    return NextResponse.json({ error: 'Failed to read contacts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tab, unit, name, internal, external } = await req.json();
    const db = getDb();
    
    const result = await db.contact.create({
      data: {
        tab,
        unit,
        name,
        internal: String(internal),
        external: String(external),
      },
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('Failed to add contact:', err);
    return NextResponse.json({ error: 'Failed to save contact' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, tab, unit, name, internal, external } = await req.json();
    const db = getDb();
    
    const result = await db.contact.update({
      where: { id },
      data: {
        tab,
        unit,
        name,
        internal: String(internal),
        external: String(external),
      },
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('Failed to update contact:', err);
    return NextResponse.json({ error: 'Failed to save contacts' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const db = getDb();
    
    await db.contact.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete contact:', err);
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}
