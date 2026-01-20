const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./app');

describe('Users Service API Tests', () => {
    beforeAll(async () => {
        // Connect to MongoDB if not already connected
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }
    });

    afterAll(async () => {
        // Close database connection
        await mongoose.connection.close();
    });

    describe('GET /api/users/:id', () => {
        it('should return user with correct structure including total', async () => {
            // Replace with a valid user id from your database
            const testUserId = 1;

            const response = await request(app)
                .get(`/api/users/${testUserId}`)
                .expect(200);

            expect(response.body).toHaveProperty('first_name');
            expect(response.body).toHaveProperty('last_name');
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('total');
            expect(typeof response.body.total).toBe('number');
        });

        it('should return 404 for non-existent user', async () => {
            const response = await request(app)
                .get('/api/users/99999')
                .expect(404);

            expect(response.body).toHaveProperty('message', 'User not found');
        });
    });

    describe('GET /api/users', () => {
        it('should return array of users', async () => {
            const response = await request(app)
                .get('/api/users')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('POST /api/add', () => {
        it('should create a new user', async () => {
            const newUser = {
                id: Math.floor(Math.random() * 100000),
                first_name: 'Test',
                last_name: 'User',
                birthday: '1990-01-01'
            };

            const response = await request(app)
                .post('/api/add')
                .send(newUser)
                .expect(200);

            expect(response.body).toHaveProperty('id', newUser.id);
            expect(response.body).toHaveProperty('first_name', newUser.first_name);
        });
    });
});
