// I calculate BMI using the standard formula that doctors use
function calculateBMI(height, weight) {
    // I convert height from cm to meters first
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    // I determine the category based on medical standards
    let category;
    if (bmi < 18.5) {
        category = 'Underweight';
    } else if (bmi >= 18.5 && bmi < 25) {
        category = 'Normal weight';
    } else if (bmi >= 25 && bmi < 30) {
        category = 'Overweight';
    } else {
        category = 'Obese';
    }
    
    return {
        value: Math.round(bmi * 10) / 10, // I round to one decimal place
        category: category
    };
}

// I use the Mifflin-St Jeor Equation because it's the most accurate for most people
function calculateBMR(weight, height, age, gender, activityLevel) {
    let bmr;
    
    // I calculate differently for men and women because they have different metabolic rates
    if (gender === 'male') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    
    // I multiply by activity level to get realistic daily calorie needs
    const activityMultipliers = {
        'sedentary': 1.2,      // Little or no exercise - I account for this
        'lightly_active': 1.375, // Light exercise 1-3 days/week
        'moderately_active': 1.55, // Moderate exercise 3-5 days/week  
        'very_active': 1.725,   // Hard exercise 6-7 days/week
        'extremely_active': 1.9 // Very hard exercise, physical job
    };
    
    const dailyCalories = Math.round(bmr * (activityMultipliers[activityLevel] || 1.2));
    
    return {
        value: Math.round(bmr),
        dailyCalories: dailyCalories
    };
}

// I help people reach their goals by adjusting their calorie targets
function calculateTargetCalories(bmr, goal) {
    // I use proven calorie adjustments for different goals
    const goalAdjustments = {
        'weight_loss': -500,    // 500 calorie deficit helps lose 1 pound per week
        'maintenance': 0,       // No adjustment needed to maintain current weight
        'muscle_gain': 300      // 300 calorie surplus supports muscle growth
    };
    
    return bmr + (goalAdjustments[goal] || 0);
}

// I calculate macronutrient ratios based on fitness goals
function getRecommendedMacros(calories, goal) {
    let proteinRatio, fatRatio, carbRatio;
    
    // I adjust these ratios based on what works best for each goal
    switch (goal) {
        case 'weight_loss':
            proteinRatio = 0.3; // I increase protein for weight loss to preserve muscle
            fatRatio = 0.25;    // Moderate fat
            carbRatio = 0.45;   // Lower carbs
            break;
        case 'muscle_gain':
            proteinRatio = 0.25; // Good protein for muscle building
            fatRatio = 0.2;     // Lower fat to make room for carbs
            carbRatio = 0.55;   // Higher carbs for energy
            break;
        default: // maintenance
            proteinRatio = 0.2; // Balanced approach
            fatRatio = 0.25;    
            carbRatio = 0.55;   
            break;
    }
    
    return {
        protein: Math.round((calories * proteinRatio) / 4), // I use 4 calories per gram of protein
        fat: Math.round((calories * fatRatio) / 9),        // 9 calories per gram of fat
        carbs: Math.round((calories * carbRatio) / 4)       // 4 calories per gram of carbs
    };
}

function getWorkoutRecommendations(bmi, fitnessLevel, goals) {
    const recommendations = {
        workouts: [],
        intensity: 'moderate',
        duration: 30
    };
    
    // Adjust based on BMI
    if (bmi < 18.5) {
        recommendations.intensity = 'low';
        recommendations.duration = 20;
    } else if (bmi >= 30) {
        recommendations.intensity = 'low';
        recommendations.duration = 25;
    }
    
    // Adjust based on fitness level
    if (fitnessLevel === 'beginner') {
        recommendations.intensity = 'low';
        recommendations.duration = Math.min(recommendations.duration, 25);
    } else if (fitnessLevel === 'advanced') {
        recommendations.intensity = 'high';
        recommendations.duration = Math.max(recommendations.duration, 45);
    }
    
    // Adjust based on goals
    if (goals.includes('weight_loss')) {
        recommendations.duration += 10;
    } else if (goals.includes('muscle_gain')) {
        recommendations.intensity = 'high';
    }
    
    return recommendations;
}

module.exports = {
    calculateBMI,
    calculateBMR,
    calculateTargetCalories,
    getRecommendedMacros,
    getWorkoutRecommendations
}; 