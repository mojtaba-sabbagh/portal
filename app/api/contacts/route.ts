import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { NextRequest, NextResponse } from 'next/server';

const filePath = path.join(process.cwd(), 'public/data', 'contacts.yaml');

export async function GET() {
  try {
    const file = await fs.readFile(filePath, 'utf-8');
    const data = yaml.load(file);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Failed to read contacts.yaml:', err);
    return NextResponse.json({ error: 'Failed to read contacts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const updatedContacts = await req.json();
    await fs.writeFile(filePath, yaml.dump(updatedContacts), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to write contacts.yaml:', err);
    return NextResponse.json({ error: 'Failed to save contacts' }, { status: 500 });
  }
}
