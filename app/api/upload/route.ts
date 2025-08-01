import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${randomUUID()}-${file.name}`;
  const filepath = path.join(process.cwd(), 'public', 'banners', filename);

  await writeFile(filepath, buffer);

  return NextResponse.json({ success: true, path: `/banners/${filename}` });
}
