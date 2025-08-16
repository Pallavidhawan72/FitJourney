const axios = require('axios');

// Service for finding recipes and meal recommendations
class SpoonacularService {
    constructor() {
    // Connect to Spoonacular API for recipes
        this.apiKey = process.env.SPOONACULAR_API_KEY;
        this.baseURL = 'https://api.spoonacular.com/recipes';
    }

    async getMealRecommendations(cuisine = 'indian', diet = 'balanced', calories = 2000, intolerances = []) {
        try {
            const params = {
                apiKey: this.apiKey,
                cuisine: cuisine,
                diet: diet,
                maxCalories: calories,
                number: 20,
                addRecipeNutrition: true,
                addRecipeInformation: true,
                fillIngredients: true
            };

            // Add optional filters for intolerances
            if (intolerances) {
                if (Array.isArray(intolerances) && intolerances.length > 0) {
                    params.intolerances = intolerances.join(',');
                } else if (typeof intolerances === 'string' && intolerances.trim() !== '') {
                    params.intolerances = intolerances;
                }
            }

            const response = await axios.get(`${this.baseURL}/complexSearch`, { params });
            console.log('Spoonacular API response:', JSON.stringify(response.data, null, 2));

            if (!response.data || !Array.isArray(response.data.results)) {
                console.error('Spoonacular API did not return expected results:', response.data);
                return [];
            }

            return response.data.results.map(recipe => ({
                id: recipe.id,
                title: recipe.title,
                image: recipe.image,
                calories: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0,
                protein: recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0,
                carbs: recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0,
                fat: recipe.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0,
                readyInMinutes: recipe.readyInMinutes,
                servings: recipe.servings,
                cuisines: recipe.cuisines,
                dishTypes: recipe.dishTypes,
                summary: recipe.summary
            }));
        } catch (error) {
            if (error.response) {
                console.error('Spoonacular API error response:', error.response.data);
            } else {
                console.error('Error fetching meal recommendations:', error);
            }
            console.log('No fallback meals configured - returning empty array');
            return [];
        }
    }

    async getRecipeDetails(recipeId) {
        try {
            const response = await axios.get(`${this.baseURL}/${recipeId}/information`, {
                params: {
                    apiKey: this.apiKey
                }
            });

            // I organize all the recipe details in a clean format
            return {
                id: response.data.id,
                title: response.data.title,
                image: response.data.image,
                summary: response.data.summary,
                instructions: response.data.instructions,
                ingredients: response.data.extendedIngredients,
                nutrition: response.data.nutrition,
                readyInMinutes: response.data.readyInMinutes,
                servings: response.data.servings,
                cuisines: response.data.cuisines,
                dishTypes: response.data.dishTypes
            };
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            throw error;
        }
    }

    async searchRecipes(query, cuisine = null, diet = null) {
        try {
            const params = {
                apiKey: this.apiKey,
                query: query,
                number: 10,
                addRecipeInformation: true
            };

            // I add optional filters to help find exactly what you're craving
            if (cuisine) params.cuisine = cuisine;
            if (diet) params.diet = diet;

            const response = await axios.get(`${this.baseURL}/complexSearch`, { params });
            return response.data.results;
        } catch (error) {
            console.error('Error searching recipes:', error);
            throw error;
        }
    }
}

module.exports = new SpoonacularService(); 