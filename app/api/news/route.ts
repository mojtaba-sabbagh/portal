import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import yaml from 'js-yaml';

const filePath = path.join(process.cwd(), 'public/data', 'news.yaml');

export async function GET() {
  try {
    const file = await fs.readFile(filePath, 'utf-8');
    const news = yaml.load(file);
    return NextResponse.json(news);
  } catch {
    return NextResponse.json({ error: 'Failed to read news' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const newItem = await req.json();
  const file = await fs.readFile(filePath, 'utf-8');
  const news = (yaml.load(file) || []) as any[];
  news.push(newItem);
  await fs.writeFile(filePath, yaml.dump(news), 'utf-8');
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const { index, item } = await req.json();
  const file = await fs.readFile(filePath, 'utf-8');
  const news = yaml.load(file) as any[];
  news[index] = item;
  await fs.writeFile(filePath, yaml.dump(news), 'utf-8');
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { index } = await req.json();
  const file = await fs.readFile(filePath, 'utf-8');
  const news = yaml.load(file) as any[];
  news.splice(index, 1);
  await fs.writeFile(filePath, yaml.dump(news), 'utf-8');
  return NextResponse.json({ success: true });
}
