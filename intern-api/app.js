require('dotenv').config();  // ← ADD THIS AT THE VERY TOP

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const studentRoutes = require('./routes/students');
const uploadRoutes = require('./routes/upload');  // ← ADD THIS

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/students', studentRoutes);
app.use('/api/upload', uploadRoutes);  // ← ADD THIS

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});