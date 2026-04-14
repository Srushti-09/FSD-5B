const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require('./routes/users');
app.use('/users', userRoutes);

// Basic root endpoint
app.get('/', (req, res) => {
  res.send('User Management Backend API is running');
});

if (!MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined in .env');
  process.exit(1);
}

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to MongoDB Atlas successfully`);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server and connect to MongoDB', err);
    process.exit(1);
  }
}

startServer();
