const express = require('express');
const app = express();

// body-parser
app.use(express.json());

// Add middleware for handling CORS requests from client browser
const cors = require('cors');
app.use(cors());

// Add middleware for handling communication with MongoDB database
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://seb-oc:seboc33@cluster0.uuh4q.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('MongoDB connection successful !'))
  .catch(() => console.log('MongoDB connection failed !'));

// Mounting stuffRouter at the '/api/stuff' path.
// const stuffRoutes = require('./routes/stuff');
// app.use('/api/stuff', stuffRoutes);

// Mounting userRouter at the '/api/auth' path.
// const userRoutes = require('./routes/user');
// app.use('/api/auth', userRoutes);

//provides utilities for working with file and directory paths
// const path = require('path');
//serving images from a static directory
// app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;