import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { NextRequest, NextResponse } from 'next/server';

const filePath = path.join(process.cwd(), 'public/data', 'videos.yaml');

export async function POST(req: NextRequest) {
  try {
    const reordered = await req.json();

    if (!Array.isArray(reordered)) {
      return NextResponse.json({ error: 'Invalid format: expected an array' }, { status: 400 });
    }

    await fs.writeFile(filePath, yaml.dump(reordered), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error saving reordered videos.yaml:', err);
    return NextResponse.json({ error: 'Failed to save reorder' }, { status: 500 });
  }
}
