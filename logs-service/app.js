const express = require('express');
const dotenv = require('dotenv');
const pino = require('pino');
const mongoose = require('mongoose');
const Log = require('./models/log');

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
            service: 'logs-service',
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

// GET /api/logs - retrieve all logs
app.get('/api/logs', async (req, res) => {
    try {
        const logs = await Log.find();
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching logs', error: error.message });
    }
});

// Only start server if not being imported for testing
if (require.main === module) {
    app.listen(port, () => {
        logger.info(`Server running on port ${port}`);
    });
}

module.exports = app;
