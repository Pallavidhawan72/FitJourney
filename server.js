const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set up Pug as the template engine for cleaner HTML
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware for handling requests
app.use(cors()); // Enable CORS for frontend-backend communication
app.use(bodyParser.json()); // Parse JSON data from forms
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded form submissions
app.use(express.static('public')); // Serve static assets (CSS, JS, images)

// Import API routes for fitness data
const apiRoutes = require('./routes/api');

// All API endpoints start with /api for organization
app.use('/api', apiRoutes);

// Main page routes
app.get('/test', (request, respond) => {
    respond.send('<h1>Test Route Working!</h1>');
});

app.get('/', (request, respond) => {
    try {
        console.log('Homepage route accessed');
        // Render the home page with basic info
        respond.render('index', { 
            title: 'FitJourney - Your Personal Health & Wellness Companion',
            bodyClass: 'home-page'
        });
    } catch (error) {
        console.error('Error rendering homepage:', error);
        respond.status(500).send('Error rendering homepage: ' + error.message);
    }
});

app.get('/onboarding', (request, respond) => {
    // Render onboarding page for user fitness goals
    respond.render('onboarding', { 
        title: 'Get Started - FitJourney',
        bodyClass: 'onboarding-page'
    });
});


app.get('/dashboard', (request, respond) => {
    // Render dashboard page for personalized fitness plan
    respond.render('dashboard', { 
        title: 'Dashboard - FitJourney',
        bodyClass: 'dashboard-page'
    });
});



// Handle favicon requests to avoid 404 errors
app.get('/favicon.ico', (request, respond) => {
    respond.status(204).end();
});

// Global error handler
app.use((err, request, respond, next) => {
    console.error('Oops, something went wrong:', err.stack);
    respond.status(500).json({ error: 'Something went wrong on my end! Please try again.' });
});

// 404 handler for undefined routes
app.use((request, respond) => {
    respond.status(404).json({ error: 'Sorry, I could not find that page!' });
});

app.listen(PORT, () => {
    console.log(`FitJourney server is running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to start your fitness journey!`);
});