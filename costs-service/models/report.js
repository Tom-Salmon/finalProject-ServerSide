const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// This model is for storing pre-computed monthly reports
const reportSchema = new Schema({
  userid: { type: Number, required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  costs: { type: Object, required: true } // Stores the grouped results
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
