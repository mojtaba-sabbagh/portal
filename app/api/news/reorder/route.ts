import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { NextRequest, NextResponse } from 'next/server';

const filePath = path.join(process.cwd(), 'public/data', 'news.yaml'); // 🔁 update this path if needed

export async function POST(req: NextRequest) {
  try {
    const newOrder = await req.json();

    if (!Array.isArray(newOrder)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Optional: validate each item has title/desc/date/image

    await fs.writeFile(filePath, yaml.dump(newOrder), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving reordered news:', error);
    return NextResponse.json({ error: 'Failed to save new order' }, { status: 500 });
  }
}
