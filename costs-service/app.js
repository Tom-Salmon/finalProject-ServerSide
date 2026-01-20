const express = require('express');
const dotenv = require('dotenv');
const pino = require('pino');
const mongoose = require('mongoose');
const Cost = require('./models/cost');
const Report = require('./models/report');

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

// GET /api/report - generate monthly cost report with caching (Computed Pattern)
app.get('/api/report', async (req, res) => {
    try {
        // Extract and parse query parameters
        const id = parseInt(req.query.id);
        const year = parseInt(req.query.year);
        const month = parseInt(req.query.month);

        // Validate parsed parameters
        if (isNaN(id) || isNaN(year) || isNaN(month)) {
            return res.status(400).json({ message: 'Invalid parameters: id, year, and month must be valid integers' });
        }

        // Check if user exists
        const userExists = await mongoose.connection.collection('users').findOne({ id: id });
        if (!userExists) {
            return res.status(404).json({ message: 'User not found', error: 'The specified user ID does not exist' });
        }

        // Determine if this is a past request (completed month)
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

        const isPastRequest = (year < currentYear) || (year === currentYear && month < currentMonth);

        // Try to get cached report if it's a past request
        if (isPastRequest) {
            const cachedReport = await Report.findOne({ userid: id, year, month });
            if (cachedReport) {
                return res.json(cachedReport);
            }
        }

        // Generate report using aggregation
        const aggregationResult = await Cost.aggregate([
            {
                $match: {
                    userid: id,
                    $expr: {
                        $and: [
                            { $eq: [{ $year: "$created_at" }, year] },
                            { $eq: [{ $month: "$created_at" }, month] }
                        ]
                    }
                }
            },
            {
                $project: {
                    category: 1,
                    sum: 1,
                    description: 1,
                    day: { $dayOfMonth: "$created_at" }
                }
            },
            {
                $group: {
                    _id: "$category",
                    items: {
                        $push: {
                            sum: "$sum",
                            description: "$description",
                            day: "$day"
                        }
                    }
                }
            }
        ]);

        // Post-process to ensure all categories are present
        const allCategories = ['food', 'health', 'housing', 'sports', 'education'];
        const costsArray = allCategories.map(category => {
            const found = aggregationResult.find(item => item._id === category);
            return { [category]: found ? found.items : [] };
        });

        const reportData = {
            userid: id,
            year: year,
            month: month,
            costs: costsArray
        };

        // Save to cache if it's a past request
        if (isPastRequest) {
            const newReport = new Report(reportData);
            await newReport.save();
        }

        res.json(reportData);
    } catch (error) {
        res.status(500).json({ message: 'Error generating report', error: error.message });
    }
});

app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});
