const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST: Create a user
router.post('/', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET: Retrieve users (with querying, filtering, sorting, pagination)
router.get('/', async (req, res) => {
  try {
    const { 
      name, email, age, hobbies, search, // Filters
      sortField, sortOrder, // Sorting
      page = 1, limit = 10 // Pagination
    } = req.query;

    const query = {};

    if (name) query.name = new RegExp(name, 'i');
    if (email) query.email = email;
    if (age) query.age = Number(age);
    if (hobbies) {
      if (Array.isArray(hobbies)) query.hobbies = { $in: hobbies };
      else query.hobbies = hobbies;
    }
    
    // Text search on bio
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {};
    if (sortField) {
      sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
    } else if (search) {
      sortOptions.score = { $meta: 'textScore' };
    }

    const skipIndex = (Number(page) - 1) * Number(limit);

    const users = await User.find(query, search ? { score: { $meta: 'textScore'} } : {})
      .sort(sortOptions)
      .limit(Number(limit))
      .skip(skipIndex);

    const total = await User.countDocuments(query);

    res.status(200).json({
      data: users,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalItems: total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT: Update user by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE: Delete user by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
