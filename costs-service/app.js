const express = require('express');
const dotenv = require('dotenv');
const pino = require('pino');
const mongoose = require('mongoose');
const Cost = require('./models/cost');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB', err));

const app = express();
const logger = pino();
const port = process.env.PORT || 3000;

app.use(express.json());

// Middleware: Log every HTTP request to MongoDB
app.use(async (req, res, next) => {
    try {
        const logObject = {
            level: 'info',
            service: 'costs-service',
            time: new Date(),
            method: req.method,
            url: req.originalUrl,
            msg: `Request received: ${req.method} ${req.originalUrl}`
        };
        await mongoose.connection.collection('logs').insertOne(logObject);
    } catch (error) {
        console.error('Error logging request to database:', error);
    }
    next();
});

app.get('/', (req, res) => {
    res.send(`Service is running on port ${port}`);
});

// POST /api/add - create a new cost
app.post('/api/add', async (req, res) => {
    try {
        const { description, category, userid, sum, date } = req.body;

        // Validate user existence in users collection
        const userExists = await mongoose.connection.collection('users').findOne({ id: userid });
        if (!userExists) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        const cost = new Cost({
            description,
            category,
            userid,
            sum,
            created_at: date || undefined
        });

        const savedCost = await cost.save();
        res.json(savedCost);
    } catch (error) {
        res.status(400).json({ message: 'Error creating cost', error: error.message });
    }
});

app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});
