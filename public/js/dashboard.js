// Handles closing of dashboard modals (meals, workouts, yoga, etc.)
document.addEventListener('DOMContentLoaded', function() {
    // Attach a click event to every close button inside a modal
    document.querySelectorAll('.modal .close').forEach(btn => {
        btn.addEventListener('click', function() {
            // Find the parent modal and hide it
            const modal = btn.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
        });
    });

    // Allow closing the modal by clicking on the overlay/background
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            // Only close if the user clicks directly on the modal background, not the content
            if (e.target === modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
        });
    });
});// 

// It keep track of user data and current content to make everything personalized
let userProfile = {};
let currentData = {
    workouts: [],
    meals: [],
    yogaVideos: [],
    quote: ''
};

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // I set up the dashboard in the order that makes the most sense
    loadUserProfile();
    updateDateDisplay();
    loadDashboardData();
    setupModalHandlers();
}

function loadUserProfile() {
    // I check if the user has saved their profile data
    const savedData = localStorage.getItem('fitjourney_user');
    if (savedData) {
        userProfile = JSON.parse(savedData);
        updateUserDisplay();
    } else {
        // I provide default values for testing so the dashboard still works
        userProfile = {
            name: 'Test User',
            fitnessLevel: 'beginner',
            goals: ['maintenance'],
            bmi: '22.9',
            dailyCalories: '2635'
        };
        updateUserDisplay();
        // I would normally redirect to onboarding: window.location.href = '/onboarding';
    }
}

function updateUserDisplay() {
    // I personalize the dashboard with the user's name
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userName = document.getElementById('userName');
    
    if (userProfile.name) {
        const firstName = userProfile.name.split(' ')[0];
        userNameDisplay.textContent = firstName;
        userName.textContent = `Welcome, ${firstName}!`;
    }
    
    // I update all the health metrics to keep users informed
    if (userProfile.bmi) {
        document.getElementById('bmiDisplay').textContent = userProfile.bmi;
    }
    
    if (userProfile.dailyCalories) {
        document.getElementById('caloriesDisplay').textContent = userProfile.dailyCalories;
    }
    
    if (userProfile.fitnessLevel) {
        // I map the levels to user-friendly names
        const levelMap = {
            'beginner': 'Beginner',
            'intermediate': 'Intermediate',
            'advanced': 'Advanced'
        };
        document.getElementById('workoutLevelDisplay').textContent = levelMap[userProfile.fitnessLevel] || 'Beginner';
    }
}

function updateDateDisplay() {
    // I always show today's date so users know their plan is current
    const dateDisplay = document.getElementById('currentDate');
    const today = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    dateDisplay.textContent = today.toLocaleDateString('en-US', options);
}

async function loadDashboardData() {
    try {
        console.log('Starting loadDashboardData...'); // I add debug logs to track progress
        
        // starts with motivation because it sets the tone for the day
        await loadMotivationalQuote();
        
        // Loads everything else in parallel for better performance
        console.log('Loading parallel data...'); // More debugging to help me understand what's happening
        await Promise.all([
            loadWorkouts(),
            loadMeals(),
            loadYogaVideos()
        ]);
        
        console.log('Finished loading dashboard data'); // Success! Everything loaded
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading dashboard data', 'error');
    }
}

async function loadMotivationalQuote() {
    try {
        // I fetch a motivational quote to inspire users every day
        const response = await fetch('/api/motivational-quote');
        const data = await response.json();
        
        document.getElementById('quoteText').textContent = data.quote;
        currentData.quote = data.quote;
    } catch (error) {
        console.error('Error loading motivational quote:', error);
        // I always have a backup quote when the API isn't working
        document.getElementById('quoteText').textContent = 'Every step counts towards your goals!';
    }
}

async function loadWorkouts() {
    try {
        // It will get personalized workout recommendations based on user preferences
        const response = await fetch('/api/workout-recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fitnessLevel: userProfile.fitnessLevel || 'beginner',
                goals: userProfile.goals || ['maintenance'],
                equipment: [] // I support equipment-free workouts for everyone
            })
        });
        
        const workouts = await response.json();
        currentData.workouts = workouts;
        displayWorkouts(workouts);
    } catch (error) {
        console.error('Error loading workouts:', error);
        displayWorkouts([]); // I show an empty state gracefully
    }
}

async function loadMeals() {
    try {
        console.log('Loading meals...'); // I track the meal loading process
        const response = await fetch('/api/meal-recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cuisine: userProfile.cuisine || 'indian', // I default to Indian cuisine
                diet: userProfile.diet || 'balanced',
                calories: userProfile.dailyCalories || 2000,
                intolerances: userProfile.intolerances || [] // I respect dietary restrictions
            })
        });
        
        const meals = await response.json();
        console.log('Meals received:', meals); // I log successful meal fetching
        currentData.meals = meals;
        displayMeals(meals);
    } catch (error) {
        console.error('Error loading meals:', error);
        displayMeals([]); // I handle errors gracefully
    }
}

async function loadYogaVideos() {
    try {
        // I provide yoga videos for relaxation and mental wellness
        const response = await fetch('/api/yoga-videos?type=yoga&duration=medium');
        const videos = await response.json();
        currentData.yogaVideos = videos;
        displayYogaVideos(videos);
    } catch (error) {
        console.error('Error loading yoga videos:', error);
        displayYogaVideos([]); // I always have a backup plan
    }
}

function displayWorkouts(workouts) {
    const workoutsList = document.getElementById('workoutsList');
    
    // I handle the case when no workouts are available
    if (workouts.length === 0) {
        workoutsList.innerHTML = `
            <div class="loading-text">
                <i class="fas fa-dumbbell"></i>
                <p>No workouts available at the moment</p>
            </div>
        `;
        return;
    }
    
    // It will create interactive workout cards that users can click on
    workoutsList.innerHTML = workouts.map(workout => `
        <div class="workout-item clickable" data-exercise-id="${workout.id}">
            <div class="item-thumbnail">
                ${workout.images && workout.images.length > 0 ? `
                    <img src="${workout.images[0].image}" alt="${workout.name}" 
                         style="width: 100%; height: 100%; object-fit: cover;"
                         onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-dumbbell\\' style=\\'font-size: 3rem; color: #cbd5e1;\\'></i>'">
                ` : `
                    <i class="fas fa-dumbbell"></i>
                `}
            </div>
            <div class="item-content">
                <div class="item-header">
                    <div class="item-title">${workout.name}</div>
                    <span class="item-difficulty">${workout.difficulty || 'Medium'}</span>
                </div>
                <div class="item-description">
                    ${workout.description ? workout.description.substring(0, 80) + '...' : 'Bodyweight exercise for strength and fitness.'}
                </div>
            </div>
        </div>
    `).join('');
    
    // Add click event listeners
    const workoutItems = workoutsList.querySelectorAll('.workout-item.clickable');
    workoutItems.forEach(item => {
        item.addEventListener('click', function() {
            const exerciseId = parseInt(this.getAttribute('data-exercise-id'));
            showExerciseDetails(exerciseId);
        });
    });
}

function displayMeals(meals) {
    const mealsList = document.getElementById('mealsList');
    
    console.log('DisplayMeals called with:', meals); // Debug log
    
    if (meals.length === 0) {
        mealsList.innerHTML = `
            <div class="loading-text">
                <i class="fas fa-utensils"></i>
                <p>No meals available at the moment</p>
            </div>
        `;
        return;
    }
    
    mealsList.innerHTML = meals.map(meal => `
        <div class="meal-item" onclick="showRecipeDetails(${meal.id})">
            <div class="item-thumbnail">
                ${meal.image ? `
                    <img src="${meal.image}" alt="${meal.title}" 
                         style="width: 100%; height: 100%; object-fit: cover;"
                         onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-utensils\\' style=\\'font-size: 3rem; color: #cbd5e1;\\'></i>'">
                ` : `
                    <i class="fas fa-utensils"></i>
                `}
            </div>
            <div class="item-content">
                <div class="item-header">
                    <div class="item-title">${meal.title}</div>
                    <span class="item-calories">${meal.calories || 0} cal</span>
                </div>
                <div class="item-description">
                    ${meal.summary ? meal.summary.replace(/<[^>]*>/g, '').substring(0, 80) + '...' : 'Delicious and nutritious meal.'}
                </div>
            </div>
        </div>
    `).join('');
    
    console.log('Meals HTML set:', mealsList.innerHTML); // Debug log
}

function displayYogaVideos(videos) {
    const yogaList = document.getElementById('yogaList');
    
    if (videos.length === 0) {
        yogaList.innerHTML = `
            <div class="loading-text">
                <i class="fas fa-pray"></i>
                <p>No yoga videos available at the moment</p>
            </div>
        `;
        return;
    }
    
    yogaList.innerHTML = videos.map(video => `
        <div class="yoga-item" onclick="showYogaVideoDetails('${video.id}', '${video.title.replace(/'/g, "\'")}', '${(video.description || '').replace(/'/g, "\'")}', '${video.thumbnail || ''}')">
            <div class="item-thumbnail">
                ${video.thumbnail ? 
                    `<img src="${video.thumbnail}" alt="${video.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-play\\' style=\\'font-size: 3rem; color: #cbd5e1;\\'></i>'">` :
                    `<i class="fas fa-play"></i>`
                }
            </div>
            <div class="item-content">
                <div class="item-header">
                    <div class="item-title">${video.title}</div>
                    <span class="item-duration">${video.duration || 'Medium'}</span>
                </div>
                <div class="item-description">
                    ${video.description ? video.description.substring(0, 80) + '...' : 'Relaxing yoga session for mind and body.'}
                </div>
            </div>
        </div>
    `).join('');
}

function setupModalHandlers() {
    // Video modal
    const videoModal = document.getElementById('videoModal');
    const videoClose = videoModal.querySelector('.close');
    
    videoClose.onclick = function() {
        videoModal.style.display = 'none';
        const videoPlayer = document.getElementById('videoPlayer');
        videoPlayer.src = '';
    }
    
    // Meal modal
    const mealModal = document.getElementById('mealModal');
    const mealClose = mealModal.querySelector('.close');
    mealClose.onclick = function() {
        mealModal.style.display = 'none';
    }
    // Workout modal
    const workoutModal = document.getElementById('workoutModal');
    const workoutClose = workoutModal.querySelector('.close');
    workoutClose.onclick = function() {
        workoutModal.style.display = 'none';
    }
    
    // Image lightbox modal
    const imageLightbox = document.getElementById('imageLightbox');
    const lightboxClose = imageLightbox.querySelector('.lightbox-close');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    
    lightboxClose.onclick = function() {
        imageLightbox.style.display = 'none';
    }
    
    lightboxPrev.onclick = function() {
        navigateLightbox('prev');
    }
    
    lightboxNext.onclick = function() {
        navigateLightbox('next');
    }
    
    // Keyboard navigation for lightbox
    document.addEventListener('keydown', function(e) {
        if (imageLightbox.style.display === 'block') {
            if (e.key === 'ArrowLeft') {
                navigateLightbox('prev');
            } else if (e.key === 'ArrowRight') {
                navigateLightbox('next');
            } else if (e.key === 'Escape') {
                imageLightbox.style.display = 'none';
            }
        }
    });
    
    // Close modals when clicking outside
    window.onclick = function(event) {
        if (event.target === videoModal) {
            videoModal.style.display = 'none';
        }
        if (event.target === mealModal) {
            mealModal.style.display = 'none';
        }
        if (event.target === workoutModal) {
            workoutModal.style.display = 'none';
        }
        if (event.target === imageLightbox) {
            imageLightbox.style.display = 'none';
        }
    }
}

function playVideo(videoId, title) {
    const modal = document.getElementById('videoModal');
    const modalTitle = document.getElementById('modalTitle');
    const videoPlayer = document.getElementById('videoPlayer');
    
    modalTitle.textContent = title;
    videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;
    modal.style.display = 'block';
}

async function showRecipeDetails(recipeId) {
    const modal = document.getElementById('mealModal');
    const recipeDetails = document.getElementById('mealDetails');
    
    modal.style.display = 'block';
    recipeDetails.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading recipe details...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`/api/recipe/${recipeId}`);
        const recipe = await response.json();
        
        recipeDetails.innerHTML = `
            <div class="recipe-header">
                <h2>${recipe.title}</h2>
                <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
            </div>
            <div class="recipe-info">
                <div class="recipe-meta">
                    <span><i class="fas fa-clock"></i> ${recipe.readyInMinutes} minutes</span>
                    <span><i class="fas fa-users"></i> ${recipe.servings} servings</span>
                    <span><i class="fas fa-fire"></i> ${recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0} calories</span>
                </div>
                <div class="recipe-summary">
                    ${recipe.summary ? recipe.summary.replace(/<[^>]*>/g, '') : 'Delicious and nutritious recipe.'}
                </div>
                <div class="recipe-ingredients">
                    <h3>Ingredients</h3>
                    <ul>
                        ${recipe.ingredients ? recipe.ingredients.map(ingredient => 
                            `<li>${ingredient.original}</li>`
                        ).join('') : '<li>Ingredients not available</li>'}
                    </ul>
                </div>
                <div class="recipe-instructions">
                    <h3>Instructions</h3>
                    <div>${recipe.instructions ? recipe.instructions.replace(/\n/g, '<br>') : 'Instructions not available'}</div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading recipe details:', error);
        recipeDetails.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading recipe details. Please try again.</p>
            </div>
        `;
    }
}

async function showExerciseDetails(exerciseId) {
    console.log('showExerciseDetails called with ID:', exerciseId);
    const modal = document.getElementById('workoutModal');
    const exerciseDetails = document.getElementById('workoutDetails');
// Show yoga video details in modal
function showYogaVideoDetails(videoId, title, description, thumbnail) {
    const modal = document.getElementById('yogaModal');
    const videoContainer = document.getElementById('yogaVideo');
    modal.style.display = 'block';
    videoContainer.innerHTML = `
        <div class="yoga-video-header">
            <h2>${title}</h2>
        </div>
        <div class="yoga-video-content">
            ${thumbnail ? `<img src="${thumbnail}" alt="${title}" style="max-width:100%;border-radius:8px;">` : ''}
            <p>${description}</p>
            <iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
        </div>
    `;
}
window.showYogaVideoDetails = showYogaVideoDetails;
    
    modal.style.display = 'block';
    exerciseDetails.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading exercise details...</p>
        </div>
    `;
    
    try {
        // Find the exercise in our current data or fetch from API
        let exercise = currentData.workouts.find(w => w.id === exerciseId);
        
        if (!exercise) {
            // If not found in current data, fetch from API
            const response = await fetch(`/api/exercise-details/${exerciseId}`);
            exercise = await response.json();
        }
        
        exerciseDetails.innerHTML = `
            <div class="exercise-header">
                <div class="exercise-title-section">
                    <h2>${exercise.name}</h2>
                    <span class="exercise-difficulty">${exercise.difficulty || 'Medium'}</span>
                </div>
                ${exercise.images && exercise.images.length > 0 ? `
                    <div class="exercise-images">
                        ${exercise.images.map((img, index) => `
                            <img src="${img.image}" 
                                 alt="${exercise.name} - Step ${index + 1}" 
                                 class="exercise-image clickable-image" 
                                 data-exercise-name="${exercise.name}"
                                 data-image-index="${index}"
                                 data-images='${JSON.stringify(exercise.images.map(i => i.image))}'
                                 onclick="openImageLightbox('${img.image}', '${exercise.name} - Step ${index + 1}', ${index}, ${JSON.stringify(exercise.images.map(i => i.image)).replace(/"/g, '&quot;')})"
                                 onerror="this.src='https://via.placeholder.com/200x160/3b82f6/ffffff?text=💪'">
                        `).join('')}
                    </div>
                ` : `
                    <div class="exercise-images">
                        <div class="exercise-placeholder large-placeholder">
                            <i class="fas fa-dumbbell"></i>
                            <span>Exercise Demonstration</span>
                            <small>Visual guide not available</small>
                        </div>
                    </div>
                `}
            </div>
            <div class="exercise-info">
                <div class="exercise-meta">
                    <div class="meta-item">
                        <i class="fas fa-tag"></i>
                        <span>Category: ${exercise.category?.name || 'General'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-dumbbell"></i>
                        <span>Equipment: ${exercise.equipment?.map(e => e.name).join(', ') || 'None'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-muscle"></i>
                        <span>Primary Muscles: ${exercise.muscles?.map(m => m.name_en || m.name).join(', ') || 'Full body'}</span>
                    </div>
                    ${exercise.muscles_secondary?.length ? `
                        <div class="meta-item">
                            <i class="fas fa-plus-circle"></i>
                            <span>Secondary Muscles: ${exercise.muscles_secondary.map(m => m.name_en || m.name).join(', ')}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="exercise-description">
                    <h3>Description</h3>
                    <div class="description-text">
                        ${exercise.description ? exercise.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ') : 'Detailed instructions for this exercise.'}
                    </div>
                </div>
                <div class="exercise-tips">
                    <h3>Tips</h3>
                    <ul>
                        <li>Maintain proper form throughout the exercise</li>
                        <li>Start with lighter intensity and gradually increase</li>
                        <li>Focus on controlled movements</li>
                        <li>Breathe steadily during the exercise</li>
                    </ul>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading exercise details:', error);
        exerciseDetails.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading exercise details. Please try again.</p>
            </div>
        `;
    }
}

// Make function globally accessible
window.showExerciseDetails = showExerciseDetails;

// Image lightbox functionality
let currentLightboxImages = [];
let currentLightboxIndex = 0;

function openImageLightbox(imageSrc, caption, index, allImages) {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    
    currentLightboxImages = allImages;
    currentLightboxIndex = index;
    
    lightboxImage.src = imageSrc;
    lightboxCaption.textContent = caption;
    lightbox.style.display = 'block';
    
    // Update navigation buttons
    updateLightboxNavigation();
}

function updateLightboxNavigation() {
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    
    prevBtn.style.display = currentLightboxImages.length > 1 ? 'block' : 'none';
    nextBtn.style.display = currentLightboxImages.length > 1 ? 'block' : 'none';
    
    prevBtn.disabled = currentLightboxIndex === 0;
    nextBtn.disabled = currentLightboxIndex === currentLightboxImages.length - 1;
}

function navigateLightbox(direction) {
    if (direction === 'prev' && currentLightboxIndex > 0) {
        currentLightboxIndex--;
    } else if (direction === 'next' && currentLightboxIndex < currentLightboxImages.length - 1) {
        currentLightboxIndex++;
    }
    
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    
    lightboxImage.src = currentLightboxImages[currentLightboxIndex];
    lightboxCaption.textContent = `Exercise Step ${currentLightboxIndex + 1}`;
    
    updateLightboxNavigation();
}

// Make lightbox functions globally accessible
window.openImageLightbox = openImageLightbox;
window.navigateLightbox = navigateLightbox;

// Refresh functions
function refreshDashboard() {
    loadDashboardData();
    showNotification('Dashboard refreshed!', 'success');
}

function refreshWorkouts() {
    loadWorkouts();
    showNotification('Workouts refreshed!', 'success');
}

function refreshMeals() {
    loadMeals();
    showNotification('Meals refreshed!', 'success');
}

function refreshYoga() {
    loadYogaVideos();
    showNotification('Yoga videos refreshed!', 'success');
}

// Quick action functions
function startWorkout() {
    if (currentData.workouts.length > 0) {
        showNotification('Starting your workout!', 'success');
        // Add workout timer or redirect to workout page
    } else {
        showNotification('No workouts available', 'error');
    }
}

function viewMealPlan() {
    if (currentData.meals.length > 0) {
        showNotification('Opening meal plan...', 'success');
        // Show detailed meal plan
    } else {
        showNotification('No meal plan available', 'error');
    }
}

function startYoga() {
    if (currentData.yogaVideos.length > 0) {
        const firstVideo = currentData.yogaVideos[0];
        playVideo(firstVideo.id, firstVideo.title);
    } else {
        showNotification('No yoga videos available', 'error');
    }
}

function updateProfile() {
    window.location.href = '/onboarding';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    if (type === 'error') {
        notification.style.background = '#ff6b6b';
    } else if (type === 'success') {
        notification.style.background = '#51cf66';
    } else {
        notification.style.background = '#667eea';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'r':
                e.preventDefault();
                refreshDashboard();
                break;
            case 'w':
                e.preventDefault();
                startWorkout();
                break;
            case 'm':
                e.preventDefault();
                viewMealPlan();
                break;
            case 'y':
                e.preventDefault();
                startYoga();
                break;
        }
    }
    
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }
});

// Add accessibility
document.addEventListener('DOMContentLoaded', function() {
    const interactiveElements = document.querySelectorAll('button, .workout-item, .meal-item, .yoga-item');
    interactiveElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid #667eea';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
});

console.log('FitJourney Dashboard - Your daily health companion'); 
