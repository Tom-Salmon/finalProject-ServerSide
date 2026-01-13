const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Flexible schema to read logs created by Pino
const logSchema = new Schema({
  level: Number,
  time: Number,
  msg: String,
  pid: Number,
  hostname: String
}, { strict: false }); // strict: false allows generic retrieval

const Log = mongoose.model('Log', logSchema, 'logs'); // Explicitly look in 'logs' collection
module.exports = Log;
