const express = require('express');
const dotenv = require('dotenv');
const pino = require('pino');
const mongoose = require('mongoose');
const User = require('./models/user');

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
            service: 'users-service',
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

// POST /api/add - Create a new user
app.post('/api/add', async (req, res) => {
    try {
        const { id, first_name, last_name, birthday } = req.body;
        const newUser = new User({
            id,
            first_name,
            last_name,
            birthday
        });
        const savedUser = await newUser.save();
        res.json(savedUser);
    } catch (error) {
        res.json({ message: 'Error creating user', error: error.message });
    }
});

// GET /api/users/:id - Get user by custom id
app.get('/api/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.json({ message: 'User not found' });
        }
        res.json({
            first_name: user.first_name,
            last_name: user.last_name,
            id: user.id,
            birthday: user.birthday
        });
    } catch (error) {
        res.json({ message: 'Error fetching user', error: error.message });
    }
});

// GET /api/users - Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.json({ message: 'Error fetching users', error: error.message });
    }
});

app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});
