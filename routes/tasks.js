const router = require('express').Router();
const Task = require('../models/Task');
const verifyToken = require('../middleware/auth');

// Get all tasks for the logged-in user (Protected)
router.get('/', verifyToken, async (req, res) => {
  try {
    // 👇 Filter by userId so users only see their own tasks
    const tasks = await Task.find({ userId: req.user.id }).sort({ order: 1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a task linked to the logged-in user (Protected)
router.post('/', verifyToken, async (req, res) => {
  try {
    // 👇 Inject the logged-in user's ID into the task data before saving
    const newTask = new Task({
      ...req.body,
      userId: req.user.id
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
    // 👇 Ensure the task belongs to the user trying to modify it
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
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
    // 👇 Ensure they can only comment on their own board's tasks
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
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