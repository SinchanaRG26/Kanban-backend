const router = require('express').Router();
const Task = require('../models/Task');
const verifyToken = require('../middleware/auth');

// Get all tasks for the logged-in user (Protected)
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    if (!userId) {
      return res.status(400).json({ error: "User identity could not be verified from token." });
    }

    const tasks = await Task.find({ userId: userId }).sort({ order: 1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a task linked to the logged-in user (Protected)
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    if (!userId) {
      return res.status(400).json({ error: "User identity could not be verified from token." });
    }

    const newTask = new Task({
      ...req.body,
      userId: userId
    });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task status / drag and drop (Protected)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    if (!userId) {
      return res.status(400).json({ error: "User identity could not be verified from token." });
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: userId },
      { $set: req.body },
      { new: true }
    );
    
    if (!updatedTask) return res.status(404).json({ error: 'Task not found or unauthorized' });
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a comment to a task card (Protected)
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    if (!userId) {
      return res.status(400).json({ error: "User identity could not be verified from token." });
    }

    const task = await Task.findOne({ _id: req.params.id, userId: userId });
    if (!task) return res.status(404).json({ error: 'Task not found or unauthorized' });

    const newComment = { username: req.user.username, text: req.body.text };
    task.comments.push(newComment);
    await task.save();
    
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;