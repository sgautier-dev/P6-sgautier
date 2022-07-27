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

// add plugin for handling mongodb errors globally
const mongodbErrorHandler = require('mongoose-mongodb-errors');
mongoose.plugin(mongodbErrorHandler);

// Add middleware for securing HTTP headers
const helmet = require('helmet');
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Add middleware to prevent MongoDB Operator Injection, $ and . characters are removed completely
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());

// Add middleware to sanitize user input coming from POST body, GET queries, and url params
const xss = require('xss-clean');
app.use(xss());


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