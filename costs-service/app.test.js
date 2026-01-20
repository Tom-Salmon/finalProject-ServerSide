const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./app');

describe('Costs Service API Tests', () => {
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

    describe('POST /api/add', () => {
        it('should create a new cost with valid data', async () => {
            const newCost = {
                description: 'Test grocery shopping',
                category: 'food',
                userid: 1, // Make sure this user exists in your DB
                sum: 150
            };

            const response = await request(app)
                .post('/api/add')
                .send(newCost)
                .expect(200);

            expect(response.body).toHaveProperty('description', newCost.description);
            expect(response.body).toHaveProperty('category', newCost.category);
            expect(response.body).toHaveProperty('sum', newCost.sum);
        });

        it('should return 400 for non-existent user', async () => {
            const invalidCost = {
                description: 'Test',
                category: 'food',
                userid: 99999, // Non-existent user
                sum: 100
            };

            const response = await request(app)
                .post('/api/add')
                .send(invalidCost)
                .expect(400);

            expect(response.body).toHaveProperty('message', 'User does not exist');
        });

        it('should return 400 for invalid category', async () => {
            const invalidCost = {
                description: 'Test',
                category: 'invalid_category',
                userid: 1,
                sum: 100
            };

            const response = await request(app)
                .post('/api/add')
                .send(invalidCost)
                .expect(400);

            expect(response.body).toHaveProperty('message', 'Error creating cost');
        });
    });

    describe('GET /api/report', () => {
        it('should return report with correct structure', async () => {
            const response = await request(app)
                .get('/api/report')
                .query({ id: 1, year: 2024, month: 1 })
                .expect(200);

            expect(response.body).toHaveProperty('userid');
            expect(response.body).toHaveProperty('year');
            expect(response.body).toHaveProperty('month');
            expect(response.body).toHaveProperty('costs');
            expect(Array.isArray(response.body.costs)).toBe(true);

            // Check that all categories are present
            const categories = ['food', 'health', 'housing', 'sports', 'education'];
            response.body.costs.forEach(costItem => {
                const category = Object.keys(costItem)[0];
                expect(categories).toContain(category);
            });
        });

        it('should return 404 for non-existent user', async () => {
            const response = await request(app)
                .get('/api/report')
                .query({ id: 99999, year: 2024, month: 1 })
                .expect(404);

            expect(response.body).toHaveProperty('message', 'User not found');
        });

        it('should return 400 for invalid parameters', async () => {
            const response = await request(app)
                .get('/api/report')
                .query({ id: 'invalid', year: 2024, month: 1 })
                .expect(400);

            expect(response.body.message).toContain('Invalid parameters');
        });
    });
});
