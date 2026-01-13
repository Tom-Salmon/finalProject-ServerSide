const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const costSchema = new Schema({
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['food', 'health', 'housing', 'sports', 'education'] 
  },
  userid: { type: Number, required: true },
  sum: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});

const Cost = mongoose.model('Cost', costSchema);
module.exports = Cost;
