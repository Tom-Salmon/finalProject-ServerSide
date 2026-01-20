const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./app');

describe('Admin Service API Tests', () => {
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

    describe('GET /api/about', () => {
        it('should return status 200', async () => {
            const response = await request(app)
                .get('/api/about')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should return array of team members from .env', async () => {
            const response = await request(app)
                .get('/api/about')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);

            // Check structure if team members exist
            if (response.body.length > 0) {
                expect(response.body[0]).toHaveProperty('first_name');
                expect(response.body[0]).toHaveProperty('last_name');
            }
        });
    });

    describe('GET /', () => {
        it('should return service running message', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);

            expect(response.text).toContain('Service is running');
        });
    });
});
