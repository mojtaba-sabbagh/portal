import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import yaml from 'js-yaml';

const filePath = path.join(process.cwd(), 'public/data', 'banners.yaml');

export async function GET() {
  try {
    const file = await fs.readFile(filePath, 'utf-8');
    const banners = yaml.load(file);

    if (!Array.isArray(banners)) throw new Error("Invalid YAML format");

    return NextResponse.json(banners);
  } catch (err) {
    console.error("API ERROR:", err);
    return NextResponse.json({ error: 'Failed to load banners' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const banner = await req.json();
    const file = await fs.readFile(filePath, 'utf-8');
    const banners = (yaml.load(file) || []) as any[];
    banners.push(banner);
    await fs.writeFile(filePath, yaml.dump(banners), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add banner' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { index, banner } = await req.json();
    const file = await fs.readFile(filePath, 'utf-8');
    const banners = yaml.load(file) as any[];
    banners[index] = banner;
    await fs.writeFile(filePath, yaml.dump(banners), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { index } = await req.json();
    const file = await fs.readFile(filePath, 'utf-8');
    const banners = yaml.load(file) as any[];
    banners.splice(index, 1);
    await fs.writeFile(filePath, yaml.dump(banners), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
