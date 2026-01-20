// Seeder script to populate demo data for all services
// Usage: node seed.js

const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Load env (prefers users-service .env as they all share the same URI)
dotenv.config({ path: path.join(__dirname, 'users-service', '.env') });

if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set. Please ensure .env is configured.');
    process.exit(1);
}

async function run() {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db();

    // Seed users
    const users = [
        { id: 1, first_name: 'Mosh', last_name: 'Israeli', birthday: new Date('1990-01-01') },
        { id: 2, first_name: 'Israel', last_name: 'Israeli', birthday: new Date('1992-05-15') }
    ];
    await db.collection('users').deleteMany({ id: { $in: users.map(u => u.id) } });
    await db.collection('users').insertMany(users);

    // Seed costs (includes a past month for report caching and current month)
    const costs = [
        { description: 'Lunch', category: 'food', userid: 1, sum: 25, created_at: new Date('2024-01-10') },
        { description: 'Gym', category: 'sports', userid: 1, sum: 45, created_at: new Date('2024-01-15') },
        { description: 'Books', category: 'education', userid: 2, sum: 60, created_at: new Date('2024-02-05') },
        { description: 'Rent', category: 'housing', userid: 1, sum: 900, created_at: new Date() }
    ];
    await db.collection('costs').deleteMany({ userid: { $in: users.map(u => u.id) } });
    await db.collection('costs').insertMany(costs);

    // Optional: clear cached reports so tests show generation (or adjust as needed)
    await db.collection('reports').deleteMany({ userid: { $in: users.map(u => u.id) } });

    // Seed a couple of logs
    const logs = [
        { level: 'info', service: 'seed', time: new Date(), method: 'SEED', url: '/', msg: 'Seeded database' },
        { level: 'info', service: 'seed', time: new Date(), method: 'SEED', url: '/api', msg: 'Seeded database - 2' }
    ];
    await db.collection('logs').insertMany(logs);

    console.log('Seeding complete. Users, costs, and logs inserted.');
    await client.close();
}

run().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
