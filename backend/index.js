const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const educationRoutes = require('./routes/education');
const experienceRoutes = require('./routes/experience');
const skillsRoutes = require('./routes/skills');
const linksRoutes = require('./routes/links');
const achievementsRoutes = require('./routes/achievements');
const usersRoutes = require('./routes/users');
const latexRoutes = require('./routes/latex');
const morgan = require('morgan');

const app = express();
dotenv.config();

// Connect to database
connectDB();

// CORS configuration - allowing all origins
const corsOptions = {
  origin: '*',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Base route
app.get('/', (req, res) => {
    res.send('Resume Builder API is running');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/links', linksRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/latex', latexRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
