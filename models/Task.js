const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  username: { type: String, required: true },
  text: { type: String, required: true }
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  order: { type: Number, default: 0 },
  comments: [CommentSchema] // Adds collaborative comments to every task card
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);