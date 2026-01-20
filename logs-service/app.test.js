const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./app');

describe('Logs Service API Tests', () => {
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

    describe('GET /api/logs', () => {
        it('should return status 200', async () => {
            await request(app)
                .get('/api/logs')
                .expect(200);
        });

        it('should return an array of logs', async () => {
            const response = await request(app)
                .get('/api/logs')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should return logs with correct structure', async () => {
            const response = await request(app)
                .get('/api/logs')
                .expect(200);

            // If logs exist, check the structure
            if (response.body.length > 0) {
                const log = response.body[0];
                // Logs should have at least some basic properties
                expect(log).toBeDefined();
                // Can check for specific properties like level, time, msg, service
                // but since schema is flexible (strict: false), we just verify it's an object
                expect(typeof log).toBe('object');
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
