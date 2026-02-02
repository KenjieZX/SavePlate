const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saveplate', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

const inventoryRoute = require('./routes/inventory');
const authRoute = require('./routes/auth');
const mealsRoute = require('./routes/meals');
const analyticsRoute = require('./routes/analytics');
const notificationsRoute = require('./routes/notifications'); // NEW

app.use('/api/inventory', inventoryRoute);
app.use('/api/auth', authRoute);
app.use('/api/meals', mealsRoute);
app.use('/api/analytics', analyticsRoute);
app.use('/api/notifications', notificationsRoute); // NEW

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));