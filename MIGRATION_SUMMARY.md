# YAML to PostgreSQL Migration - Summary

## ✅ What Has Been Done

Your portal has been successfully set up to migrate from YAML files to PostgreSQL. Here's what was created:

### 1. Database Setup & Migration Scripts
- **`scripts/setup-db.ts`** - Creates database tables (banners, contacts, news, videos)
- **`scripts/migrate-yaml-to-db.ts`** - Imports data from YAML files to database

### 2. Database Connection Layer
- **`lib/db.ts`** - Reusable functions for database operations:
  - `getBanners()`, `reorderBanners()`
  - `getContacts()`
  - `getNews()`, `reorderNews()`
  - `getVideos()`, `reorderVideos()`
  - `getDb()` - Get raw database connection for custom queries

### 3. Updated API Routes
All API routes have been converted from YAML to database:
- `/api/banners/*` - Create, read, update, delete, reorder banners
- `/api/contacts/*` - Create, read, update, delete contacts
- `/api/news/*` - Create, read, update, delete, reorder news
- `/api/videos/*` - Create, read, update, delete, reorder videos

### 4. Updated Frontend Components
- **`app/admin/banner/page.tsx`** - Updated to use banner IDs instead of indices
- **`app/admin/contacts/page.tsx`** - Updated to use contact IDs instead of indices

### 5. Environment Configuration
Updated `.env` with database connection details:
```env
DB_HOST = "localhost"
DB_PORT = "5433"
DB_USER = "postgres"
DB_PASSWORD = "Msj.116159"
DB_NAME = "portal"
```

### 6. Documentation
- **`MIGRATION_GUIDE.md`** - Complete setup and usage instructions

## 🚀 Quick Start

### Step 1: Ensure PostgreSQL is Running
```bash
# Verify PostgreSQL is running on localhost:5433
psql -U postgres -h localhost -p 5433
```

### Step 2: Create Database Tables
```bash
pnpm db:setup
```

### Step 3: Migrate Data from YAML
```bash
pnpm db:migrate
```

### Step 4: Test Your Application
```bash
pnpm dev
```

Visit your admin pages to verify everything works!

## 📊 Database Schema

### banners table
```sql
id (PRIMARY KEY)
title (VARCHAR 255)
image (VARCHAR 500)
link (VARCHAR 500)
order_index (INT) - For drag-and-drop ordering
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### contacts table
```sql
id (PRIMARY KEY)
tab (VARCHAR 50) - Tab name (e.g., "tab1", "tab2")
unit (VARCHAR 255) - Department/unit name
name (VARCHAR 255) - Person's name
internal (INT) - Internal phone number
external (INT) - External phone number
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### news table
```sql
id (PRIMARY KEY)
title (VARCHAR 500)
description (TEXT)
date (VARCHAR 50)
image (VARCHAR 500)
order_index (INT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### videos table
```sql
id (PRIMARY KEY)
category (VARCHAR 255) - Video category name
label (VARCHAR 255) - Video title/label
src (VARCHAR 500) - Video file path
order_index (INT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

## 🔄 API Changes

### Old API (YAML-based)
```javascript
// Old: Used array indices
PUT /api/banners { index: 0, banner: {...} }
DELETE /api/banners { index: 0 }
```

### New API (Database-based)
```javascript
// New: Uses database IDs
PUT /api/banners { id: 123, title: "...", image: "...", link: "..." }
DELETE /api/banners { id: 123 }
POST /api/banners/reorder [{ id: 123, order: 0 }, { id: 124, order: 1 }]
```

## 📝 Usage Example

```typescript
import { getBanners, getNews, getDb } from '@/lib/db';

// Get all banners
const banners = await getBanners();

// Get all news
const news = await getNews();

// Use raw database connection for custom queries
const db = getDb();
const customResult = await db`
  SELECT * FROM banners 
  WHERE title LIKE ${'%test%'} 
  ORDER BY order_index ASC
`;
```

## ⚠️ Important Notes

1. **YAML Files**: You can delete `public/data/*.yaml` files after verifying everything works
2. **Backup**: Consider backing up your PostgreSQL database
3. **Package Scripts**: Two new npm scripts added:
   - `pnpm db:setup` - Create tables
   - `pnpm db:migrate` - Import data

## 🐛 Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running on `localhost:5433`
- Check credentials in `.env`

### Tables Already Exist
- Script will skip table creation if they already exist
- To reset, run: `DROP TABLE IF EXISTS banners, contacts, news, videos;`

### Migration Failed
- Ensure YAML files exist in `public/data/`
- Check file format matches expected structure
- Verify database user has CREATE/INSERT permissions

## 📞 Support

Refer to `MIGRATION_GUIDE.md` for detailed setup and API documentation.
