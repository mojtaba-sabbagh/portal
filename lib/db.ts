import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const getDb = () => {
  if (!globalForPrisma.prisma) {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
};

// Banners
export async function getBanners() {
  const db = getDb();
  return db.banner.findMany({
    orderBy: { orderIndex: 'asc' },
  });
}

export async function reorderBanners(items: { id: number; order: number }[]) {
  const db = getDb();
  for (const item of items) {
    await db.banner.update({
      where: { id: item.id },
      data: { orderIndex: item.order },
    });
  }
}

// Contacts
export async function getContacts() {
  const db = getDb();
  const rows = await db.contact.findMany({
    orderBy: [{ tab: 'asc' }, { id: 'asc' }],
  });

  // Group by tab
  const grouped: { [key: string]: typeof rows } = {};
  for (const row of rows) {
    if (!grouped[row.tab]) {
      grouped[row.tab] = [];
    }
    grouped[row.tab].push(row);
  }

  return grouped;
}

// News
export async function getNews() {
  const db = getDb();
  return db.news.findMany({
    orderBy: { orderIndex: 'desc' },
  });
}

export async function reorderNews(items: { id: number; order: number }[]) {
  const db = getDb();
  for (const item of items) {
    await db.news.update({
      where: { id: item.id },
      data: { orderIndex: item.order },
    });
  }
}

// Videos
export async function getVideos() {
  const db = getDb();
  const rows = await db.video.findMany({
    orderBy: [{ category: 'asc' }, { orderIndex: 'asc' }],
  });

  // Group by category
  const grouped: { category: string; videos: { label: string; src: string }[] }[] = [];
  let currentCategory = '';
  let currentGroup: { category: string; videos: { label: string; src: string }[] } | null = null;

  for (const row of rows) {
    if (row.category !== currentCategory) {
      if (currentGroup) {
        grouped.push(currentGroup);
      }
      currentCategory = row.category;
      currentGroup = {
        category: row.category,
        videos: [],
      };
    }

    if (currentGroup) {
      currentGroup.videos.push({
        label: row.label,
        src: row.src,
      });
    }
  }

  if (currentGroup) {
    grouped.push(currentGroup);
  }

  return grouped;
}

export async function reorderVideos(items: { id: number; category: string; order: number }[]) {
  const db = getDb();
  for (const item of items) {
    await db.video.update({
      where: { id: item.id },
      data: { orderIndex: item.order },
    });
  }
}

