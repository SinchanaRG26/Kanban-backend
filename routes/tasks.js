const router = require('express').Router();
const Task = require('../models/Task');
const verifyToken = require('../middleware/auth');

// Get all tasks (Protected)
router.get('/', verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find().sort({ order: 1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a task (Protected)
router.post('/', verifyToken, async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task status / drag and drop (Protected)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a comment to a task card (Protected)
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const newComment = { username: req.user.username, text: req.body.text };
    task.comments.push(newComment);
    await task.save();
    
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;