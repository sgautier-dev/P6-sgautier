require('dotenv').config();// access to .env file variables
const express = require('express');
const app = express();

// body-parser
app.use(express.json());

// Add middleware for handling CORS requests from client browser
const cors = require('cors');
app.use(cors());

// Add middleware for handling communication with MongoDB database
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_CONNECT_STRING,// connection string from .env
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('MongoDB connection successful !'))
  .catch(() => console.log('MongoDB connection failed !'));


// Mounting userRouter on '/api/auth' path.
const userRoutes = require('./routes/userRoute');
app.use('/api/auth', userRoutes);

  // Mounting sauceRouter on '/api/sauce' path.
const sauceRoutes = require('./routes/sauceRoute');
app.use('/api/sauces', sauceRoutes);

//provides utilities for working with file and directory paths
const path = require('path');
//serving images from a static directory
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;