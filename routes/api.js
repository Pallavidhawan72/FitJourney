const express = require('express');
const router = express.Router();
// Import custom service files for each API
const wgerService = require('../services/wgerService');
const spoonacularService = require('../services/spoonacularService');
const youtubeService = require('../services/youtubeService');
// Utility for health metric calculations
const { calculateBMI, calculateBMR } = require('../utils/healthCalculations');

// Get bodyweight exercises from WGER
router.get('/exercises', async (request, respond) => {
    try {
        const exercises = await wgerService.getBodyweightExercises();
        respond.json(exercises);
    } catch (error) {
        console.error('Hmm, I had trouble getting exercises:', error);
        respond.status(500).json({ error: 'I could not fetch exercises right now, please try again!' });
    }
});

// Customize workout recommendations based on user input
router.post('/workout-recommendations', async (request, respond) => {
    try {
        const { fitnessLevel, goals, equipment } = request.body;
        const workouts = await wgerService.getWorkoutRecommendations(fitnessLevel, goals, equipment);
        respond.json(workouts);
    } catch (error) {
        console.error('I encountered an issue with workout recommendations:', error);
        respond.status(500).json({ error: 'I could not get workout recommendations right now, please try again!' });
    }
});

// Provide meal recommendations
router.post('/meal-recommendations', async (request, respond) => {
    try {
    console.log('Meal recommendations requested:', request.body);
        const { cuisine, diet, calories, intolerances } = request.body;
        const meals = await spoonacularService.getMealRecommendations(cuisine, diet, calories, intolerances);
    console.log('Meal recommendations found:', meals.length);
        respond.json(meals);
    } catch (error) {
        console.error('I had trouble finding meals:', error);
        respond.status(500).json({ error: 'I could not find meals right now, please try again!' });
    }
});

// Get detailed recipe information
router.get('/recipe/:id', async (request, respond) => {
    try {
        const recipeId = request.params.id;
        const recipe = await spoonacularService.getRecipeDetails(recipeId);
        respond.json(recipe);
    } catch (error) {
        console.error('I could not get recipe details:', error);
        respond.status(500).json({ error: 'I could not get recipe details right now, please try again!' });
    }
});

// Provide yoga and meditation video recommendations
router.get('/yoga-videos', async (request, respond) => {
    try {
        const { type = 'yoga', duration = 'medium' } = request.query;
        console.log(`API request for yoga videos: type=${type}, duration=${duration}`);
        const videos = await youtubeService.getYogaVideos(type, duration);
        console.log(`Returning ${videos.length} videos to client`);
        respond.json(videos);
    } catch (error) {
        console.error('I had trouble finding yoga videos:', error);
        respond.status(500).json({ error: 'I could not find yoga videos right now, please try again!' });
    }
});

// Endpoint to test YouTube API connection
router.get('/test-youtube', async (request, respond) => {
    try {
        const testResult = await youtubeService.testApiConnection();
        respond.json(testResult);
    } catch (error) {
        console.error('YouTube API test failed:', error);
        respond.status(500).json({ 
            success: false, 
            error: 'Failed to test YouTube API connection' 
        });
    }
});

// Calculate health metrics
router.post('/health-calculations', (request, respond) => {
    try {
        const { height, weight, age, gender, activityLevel } = request.body;
        
    // Use standard formulas to calculate metrics
        const bmi = calculateBMI(height, weight);
        const bmr = calculateBMR(weight, height, age, gender, activityLevel);
        
        respond.json({
            bmi: bmi.value,
            bmiCategory: bmi.category,
            bmr: bmr.value,
            dailyCalories: bmr.dailyCalories
        });
    } catch (error) {
        console.error('I had trouble calculating health metrics:', error);
        respond.status(500).json({ error: 'I could not calculate health metrics right now, please try again!' });
    }
});

// Provide motivational quotes
router.get('/motivational-quote', (request, respond) => {
    try {
        // I hand-picked these quotes because they really inspire me
        const quotes = [
            "The only bad workout is the one that didn't happen.",
            "Your body can stand almost anything. It's your mind you have to convince.",
            "The difference between try and triumph is just a little umph!",
            "Take care of your body. It's the only place you have to live.",
            "Fitness is not about being better than someone else. It's about being better than you used to be.",
            "The only person you are destined to become is the person you decide to be.",
            "Strength does not come from the physical capacity. It comes from an indomitable will.",
            "Every day is a new beginning. Take a deep breath and start again.",
            "The mind is everything. What you think you become.",
            "Yoga is the journey of the self, through the self, to the self."
        ];
        
        // I pick a random quote to keep things fresh
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        respond.json({ quote: randomQuote });
    } catch (error) {
        console.error('I could not get a motivational quote:', error);
        respond.status(500).json({ error: 'I could not get a motivational quote right now!' });
    }
});

// Endpoint to create a complete daily plan for each user
router.post('/daily-plan', async (request, respond) => {
    try {
        const { userProfile } = request.body;
        
    // Fetch all required data in parallel for efficiency
        const [workouts, meals, yogaVideos, quote] = await Promise.all([
            wgerService.getWorkoutRecommendations(userProfile.fitnessLevel, userProfile.goals, userProfile.equipment),
            spoonacularService.getMealRecommendations(userProfile.cuisine, userProfile.diet, userProfile.calories, userProfile.intolerances),
            youtubeService.getYogaVideos('yoga', 'medium'),
            Promise.resolve({ quote: "Your daily motivation: Every step counts towards your goals!" })
        ]);
        
        respond.json({
            workouts: workouts.slice(0, 3), // Limit to 3 workouts
            meals: meals.slice(0, 3), // Limit to 3 meals
            yogaVideos: yogaVideos.slice(0, 6), // Limit to 6 videos
            quote: quote.quote
        });
    } catch (error) {
        console.error('I had trouble creating the daily plan:', error);
        respond.status(500).json({ error: 'I could not create your daily plan right now, please try again!' });
    }
});

// Get detailed exercise information
router.get('/exercise-details/:id', async (request, respond) => {
    try {
        const exerciseId = request.params.id;
        const exercise = await wgerService.getExerciseDetails(exerciseId);
        respond.json(exercise);
    } catch (error) {
        console.error('I could not get exercise details:', error);
        respond.status(500).json({ error: 'I could not get exercise details right now, please try again!' });
    }
});

module.exports = router; 