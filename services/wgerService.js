const axios = require('axios');

// built this service to help people find amazing workout exercises
class WgerService {
    constructor() {
        // I connected to the WGER fitness database - it's one of my favorite APIs
        this.baseURL = 'https://wger.de/api/v2';
        this.apiKey = process.env.WGER_API_KEY;
    }

    async getBodyweightExercises() {
        try {
            const response = await axios.get(`${this.baseURL}/exerciseinfo/`, {
                params: {
                    category: 10, // I love bodyweight exercises - no equipment needed!
                    limit: 50,
                    status: 2 // I only get approved exercises for quality
                },
                headers: {
                    ...(this.apiKey ? { Authorization: `Token ${this.apiKey}` } : {}),
                    'accept-language': 'en'
                }
            });
            console.log('WGER getBodyweightExercises response:', JSON.stringify(response.data, null, 2));
            return response.data.results.map(exercise => {
                // I prioritize English translations but fallback gracefully
                const englishTranslation = exercise.translations.find(t => t.language === 2);
                const translation = englishTranslation || exercise.translations[0];
                
                return {
                    id: exercise.id,
                    name: translation ? translation.name : 'Unnamed Exercise',
                    description: translation ? translation.description || 'No description available.' : 'No description available.',
                    category: exercise.category,
                    muscles: exercise.muscles,
                    muscles_secondary: exercise.muscles_secondary,
                    equipment: exercise.equipment
                };
            });
        } catch (error) {
            console.error('Error fetching bodyweight exercises:', error);
            throw error;
        }
    }

    async getWorkoutRecommendations(fitnessLevel, goals, equipment = []) {
        try {
            // I carefully select exercise categories based on fitness level
            let categoryIds = [];
            
            if (fitnessLevel === 'beginner') {
                categoryIds = [10, 8, 9, 11]; // I start beginners with Abs, Cardio, Arms, Legs
            } else if (fitnessLevel === 'intermediate') {
                categoryIds = [10, 8, 9, 11, 12]; // I add Chest for intermediate users
            } else {
                categoryIds = [10, 8, 9, 11, 12, 13, 14]; // Advanced users get everything!
            }

            const exercises = [];
            
            // fetching exercises from each category to create variety
            for (const categoryId of categoryIds) {
                const response = await axios.get(`${this.baseURL}/exerciseinfo/`, {
                    params: {
                        category: categoryId,
                        limit: 30, // I increased this for more exercise variety
                        status: 2
                    },
                    headers: {
                        ...(this.apiKey ? { Authorization: `Token ${this.apiKey}` } : {}),
                        'accept-language': 'en'
                    }
                });
                console.log(`WGER category ${categoryId} response:`, response.data.results.length, 'exercises');
                
                exercises.push(...response.data.results);
            }

            // Removing duplicates and prioritize exercises with images
            const uniqueExercises = exercises.filter((exercise, index, self) => 
                index === self.findIndex(e => e.id === exercise.id)
            );
            
            // It will separate exercises based on whether they have visual guides
            const exercisesWithImages = uniqueExercises.filter(ex => ex.images && ex.images.length > 0);
            const exercisesWithoutImages = uniqueExercises.filter(ex => !ex.images || ex.images.length === 0);
            
            // shuffle both arrays to keep workouts interesting and varied
            const shuffleArray = (array) => {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            };
            
            shuffleArray(exercisesWithImages);
            shuffleArray(exercisesWithoutImages);
            
            // prioritize exercises with images first, then add others if needed
            const finalExercises = [...exercisesWithImages, ...exercisesWithoutImages].slice(0, 10);

            return finalExercises.map(exercise => {
                // I always try to get English translations for better user experience
                const englishTranslation = exercise.translations.find(t => t.language === 2);
                const translation = englishTranslation || exercise.translations[0];
                
                return {
                    id: exercise.id,
                    name: translation ? translation.name : 'Unnamed Exercise',
                    description: translation ? translation.description || 'No description available.' : 'No description available.',
                    category: exercise.category,
                    muscles: exercise.muscles,
                    equipment: exercise.equipment,
                    images: exercise.images || [],
                    difficulty: this.getDifficultyLevel(fitnessLevel)
                };
            });
        } catch (error) {
            console.error('Error fetching workout recommendations:', error);
            console.log('No fallback workouts configured - returning empty array');
            
            // I return an empty array when API is unavailable
            return [];
        }
    }

    getDifficultyLevel(fitnessLevel) {
        // I match difficulty levels to what feels right for each fitness level
        const difficultyMap = {
            'beginner': 'Easy',
            'intermediate': 'Medium',
            'advanced': 'Hard'
        };
        return difficultyMap[fitnessLevel] || 'Medium';
    }

    getFallbackWorkouts(fitnessLevel) {
        console.log(`No fallback workouts configured for fitness level: ${fitnessLevel}`);
        
        // I return an empty array when no API workouts are available
        return [];
    }

    async getExerciseDetails(exerciseId) {
        try {
            const response = await axios.get(`${this.baseURL}/exerciseinfo/${exerciseId}/`, {
                headers: {
                    ...(this.apiKey ? { Authorization: `Token ${this.apiKey}` } : {}),
                    'accept-language': 'en'
                }
            });
            
            const exercise = response.data;
            
            // I make sure to get English translations whenever possible
            const englishTranslation = exercise.translations.find(t => t.language === 2);
            const translation = englishTranslation || exercise.translations[0];
            
            return {
                id: exercise.id,
                name: translation ? translation.name : 'Unnamed Exercise',
                description: translation ? translation.description || 'No description available.' : 'No description available.',
                category: exercise.category,
                muscles: exercise.muscles,
                muscles_secondary: exercise.muscles_secondary,
                equipment: exercise.equipment,
                images: exercise.images || [],
                videos: exercise.videos || []
            };
        } catch (error) {
            console.error('Error fetching exercise details:', error);
            throw error;
        }
    }
}

module.exports = new WgerService(); 
