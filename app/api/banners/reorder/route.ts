import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { NextRequest, NextResponse } from 'next/server';

const filePath = path.join(process.cwd(), 'public/data', 'banners.yaml');

export async function POST(req: NextRequest) {
  try {
    const newOrder = await req.json();
    if (!Array.isArray(newOrder)) throw new Error("Invalid data");

    await fs.writeFile(filePath, yaml.dump(newOrder), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
  }
}
