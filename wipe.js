// Wipe script to delete all data from key collections
// Usage: npm run clean-db --prefix users-service

const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Load env (reuse users-service .env for MONGO_URI)
dotenv.config({ path: path.join(__dirname, 'users-service', '.env') });

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not set. Please ensure .env is configured.');
  process.exit(1);
}

async function wipe() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db();

  // Collections to clear
  const collections = ['users', 'costs', 'reports', 'logs'];

  for (const name of collections) {
    try {
      const result = await db.collection(name).deleteMany({});
      console.log(`Cleared ${name}: ${result.deletedCount} documents deleted.`);
    } catch (err) {
      console.error(`Failed to clear ${name}:`, err);
    }
  }

  await client.close();
  console.log('Database wipe complete.');
}

wipe().catch((err) => {
  console.error('Wipe failed:', err);
  process.exit(1);
});
