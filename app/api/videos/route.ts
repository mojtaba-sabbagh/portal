import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { NextRequest, NextResponse } from 'next/server';

const filePath = path.join(process.cwd(), 'public/data', 'videos.yaml');

export async function GET() {
  try {
    const file = await fs.readFile(filePath, 'utf-8');
    const data = yaml.load(file);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error reading videos.yaml:', err);
    return NextResponse.json({ error: 'Failed to load videos.yaml' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid format: expected an array of categories' }, { status: 400 });
    }
    await fs.writeFile(filePath, yaml.dump(body), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error writing videos.yaml:', err);
    return NextResponse.json({ error: 'Failed to write videos.yaml' }, { status: 500 });
  }
}
