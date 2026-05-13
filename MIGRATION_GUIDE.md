# YAML to PostgreSQL Migration Guide

This guide will help you migrate your portal data from YAML files to PostgreSQL.

## Setup Steps

### 1. Database Connection Verification
Your `.env` file already contains the database credentials:
```env
DB_HOST = "localhost"
DB_PORT = "5433"
DB_USER = "postgres"
DB_PASSWORD = "Msj.116159"
DB_NAME = "portal"
```

Make sure PostgreSQL is running on `localhost:5433`.

### 2. Create Database Tables

Run the database setup script to create all necessary tables:

```bash
pnpm db:setup
```

This will create 4 tables:
- **banners**: Stores banner content with title, image, link, and order
- **contacts**: Stores contact information organized by tabs
- **news**: Stores news articles with title, description, date, and image
- **videos**: Stores videos organized by category

### 3. Migrate Data from YAML to Database

Once tables are created, run the migration script:

```bash
pnpm db:migrate
```

This script will:
- Read all data from YAML files in `public/data/`
- Clear existing data from database tables (if any)
- Insert all YAML data into the respective database tables
- Maintain the order of items using the `order_index` field

## API Changes

All API routes have been updated to use PostgreSQL instead of YAML files:

### Banners API
- **GET** `/api/banners` - Get all banners
- **POST** `/api/banners` - Create new banner with `{ title, image, link }`
- **PUT** `/api/banners` - Update banner with `{ id, title, image, link }`
- **DELETE** `/api/banners` - Delete banner with `{ id }`
- **POST** `/api/banners/reorder` - Reorder banners with array of `{ id, order }`

### Contacts API
- **GET** `/api/contacts` - Get all contacts grouped by tab
- **POST** `/api/contacts` - Create contact with `{ tab, unit, name, internal, external }`
- **PUT** `/api/contacts` - Update contact with `{ id, tab, unit, name, internal, external }`
- **DELETE** `/api/contacts` - Delete contact with `{ id }`

### News API
- **GET** `/api/news` - Get all news items
- **POST** `/api/news` - Create news with `{ title, description, date, image }`
- **PUT** `/api/news` - Update news with `{ id, title, description, date, image }`
- **DELETE** `/api/news` - Delete news with `{ id }`
- **POST** `/api/news/reorder` - Reorder news with array of `{ id, order }`

### Videos API
- **GET** `/api/videos` - Get all videos grouped by category
- **POST** `/api/videos` - Create video with `{ category, label, src }`
- **PUT** `/api/videos` - Update video with `{ id, category, label, src }`
- **DELETE** `/api/videos` - Delete video with `{ id }`
- **POST** `/api/videos/reorder` - Reorder videos with array of `{ id, category, order }`

## Database Utility Functions

Import from `@/lib/db`:

```typescript
import {
  getBanners,
  reorderBanners,
  getContacts,
  getNews,
  reorderNews,
  getVideos,
  reorderVideos,
  getDb,
} from '@/lib/db';
```

Example usage:

```typescript
// Get all banners
const banners = await getBanners();

// Get all contacts (grouped by tab)
const contacts = await getContacts();

// Reorder banners
await reorderBanners([
  { id: 1, order: 2 },
  { id: 2, order: 1 },
]);

// Get raw database connection for custom queries
const db = getDb();
const customResult = await db`SELECT * FROM banners WHERE title LIKE ${'%keyword%'}`;
```

## Important Notes

1. **YAML files can be deleted** once migration is complete and you've verified everything works
2. **Connection pooling** is handled automatically by the postgres package
3. **Timestamps** (`created_at`, `updated_at`) are automatically managed
4. **Order indices** are preserved from the original YAML order during migration

## Troubleshooting

### Connection Error
- Ensure PostgreSQL is running on `localhost:5433`
- Verify database credentials in `.env`
- Check that the `kkrdb` database exists

### Migration Script Fails
- Make sure tables were created with `pnpm db:setup` first
- Verify YAML files exist in `public/data/` with correct format
- Check database permissions for your user

### Data Not Appearing
- Run `pnpm db:migrate` again to reload data
- Check database directly: `psql -U postgres -d kkrdb`

## Next Steps

1. Run `pnpm db:setup` to create tables
2. Run `pnpm db:migrate` to import data
3. Test your API endpoints
4. Remove YAML files when confident everything works
