import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

interface Banner {
  title: string;
  image: string;
  link: string;
}

interface Contact {
  unit: string;
  name: string;
  internal: number;
  external: number;
}

interface NewsItem {
  title: string;
  description: string;
  date: string;
  image: string;
}

interface Video {
  label: string;
  src: string;
}

interface VideoCategory {
  category: string;
  videos: Video[];
}

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Msj.116159@localhost:5433/portal?schema=public',
});

async function migrateBanners() {
  try {
    console.log('Migrating banners...');
    const bannersPath = path.join(process.cwd(), 'public/data/banners.yaml');
    const bannersYaml = fs.readFileSync(bannersPath, 'utf8');
    const banners = yaml.load(bannersYaml) as Banner[];

    // Clear existing data
    await client.query('DELETE FROM banners');

    for (let i = 0; i < banners.length; i++) {
      const banner = banners[i];
      await client.query(
        'INSERT INTO banners (title, image, link, order_index) VALUES ($1, $2, $3, $4)',
        [banner.title, banner.image, banner.link, i]
      );
    }

    console.log(`✓ Migrated ${banners.length} banners`);
  } catch (error) {
    console.error('✗ Error migrating banners:', error);
  }
}

async function migrateContacts() {
  try {
    console.log('Migrating contacts...');
    const contactsPath = path.join(process.cwd(), 'public/data/contacts.yaml');
    const contactsYaml = fs.readFileSync(contactsPath, 'utf8');
    const contactsData = yaml.load(contactsYaml) as { [key: string]: Contact[] };

    // Clear existing data
    await client.query('DELETE FROM contacts');

    let totalCount = 0;
    for (const [tab, contacts] of Object.entries(contactsData)) {
      for (const contact of contacts) {
        await client.query(
          'INSERT INTO contacts (tab, unit, name, internal, external) VALUES ($1, $2, $3, $4, $5)',
          [tab, contact.unit, contact.name, String(contact.internal), String(contact.external)]
        );
        totalCount++;
      }
    }

    console.log(`✓ Migrated ${totalCount} contacts`);
  } catch (error) {
    console.error('✗ Error migrating contacts:', error);
  }
}

async function migrateNews() {
  try {
    console.log('Migrating news...');
    const newsPath = path.join(process.cwd(), 'public/data/news.yaml');
    const newsYaml = fs.readFileSync(newsPath, 'utf8');
    const news = yaml.load(newsYaml) as NewsItem[];

    // Clear existing data
    await client.query('DELETE FROM news');

    for (let i = 0; i < news.length; i++) {
      const item = news[i];
      await client.query(
        'INSERT INTO news (title, description, date, image, order_index) VALUES ($1, $2, $3, $4, $5)',
        [item.title, item.description, item.date, item.image, i]
      );
    }

    console.log(`✓ Migrated ${news.length} news items`);
  } catch (error) {
    console.error('✗ Error migrating news:', error);
  }
}

async function migrateVideos() {
  try {
    console.log('Migrating videos...');
    const videosPath = path.join(process.cwd(), 'public/data/videos.yaml');
    const videosYaml = fs.readFileSync(videosPath, 'utf8');
    const videosData = yaml.load(videosYaml) as VideoCategory[];

    // Clear existing data
    await client.query('DELETE FROM videos');

    let totalCount = 0;
    for (const categoryData of videosData) {
      for (let i = 0; i < categoryData.videos.length; i++) {
        const video = categoryData.videos[i];
        await client.query(
          'INSERT INTO videos (category, label, src, order_index) VALUES ($1, $2, $3, $4)',
          [categoryData.category, video.label, video.src, i]
        );
        totalCount++;
      }
    }

    console.log(`✓ Migrated ${totalCount} videos`);
  } catch (error) {
    console.error('✗ Error migrating videos:', error);
  }
}

async function main() {
  try {
    await client.connect();
    console.log('Connected to database');

    await migrateBanners();
    await migrateContacts();
    await migrateNews();
    await migrateVideos();
    console.log('\n✓ Migration completed successfully!');
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
