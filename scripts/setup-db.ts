import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating tables...');
    
    // Check if tables exist by trying to query them
    // Prisma will automatically create tables when we use $executeRawUnsafe for migrations
    
    // Test connection
    const test = await prisma.banner.findFirst();
    console.log('✓ Tables already exist');
    
  } catch (error) {
    console.log('Tables do not exist yet. Run: npx prisma migrate deploy');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('✗ Error:', e.message);
    process.exit(1);
  });
