// Onboarding flow for new users

// Track onboarding step
let currentStep = 1;
let totalSteps = 5;
let userProfile = {};


document.addEventListener('DOMContentLoaded', function() {
    // Dynamically set totalSteps based on the number of .form-step elements
    const steps = document.querySelectorAll('.form-step');
    totalSteps = steps.length;
    initializeOnboarding();
});

function initializeOnboarding() {
    // Initialize onboarding experience
    // localStorage.removeItem('fitjourney_user'); // Do not clear user data so profile page works

    updateProgress();
    // loadUserData(); // Temporarily disable to avoid conflicts

    // Add form validation for user input
    addFormValidation();

    // Enable real-time BMI calculation for immediate feedback
    addBMICalculation();

    // Show the first onboarding step
    showStep(1);

    // Handle form submission on completion
    const form = document.getElementById('onboardingForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate the final onboarding step
    if (validateCurrentStep()) {
    // Collect all form data
        const formData = new FormData(event.target);
        const userData = {};
        for (let [key, value] of formData.entries()) {
            userData[key] = value;
        }

        // Calculate metrics before saving
        const metrics = calculateMetricsForStorage(userData);
        const userDataWithMetrics = { ...userData, ...metrics };

    // Save user data with metrics
        localStorage.setItem('fitjourney_user', JSON.stringify(userDataWithMetrics));

    // Redirect to dashboard after onboarding
        window.location.href = '/dashboard';
// Helper to calculate metrics for storage
function calculateMetricsForStorage(formData) {
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    const age = parseInt(formData.age);
    const gender = formData.gender;
    const activityLevel = formData.activityLevel;
    const goals = Array.isArray(formData.goals) ? formData.goals : [formData.goals];
    let bmi = '';
    let bmr = '';
    let dailyCalories = '';
    if (height && weight && age && gender) {
        const heightInMeters = height / 100;
        bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        if (gender === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }
        const activityMultipliers = {
            'sedentary': 1.2,
            'lightly_active': 1.375,
            'moderately_active': 1.55,
            'very_active': 1.725,
            'extremely_active': 1.9
        };
        dailyCalories = bmr * (activityMultipliers[activityLevel] || 1.2);
        if (goals.includes('weight_loss')) {
            dailyCalories -= 500;
        } else if (goals.includes('muscle_gain')) {
            dailyCalories += 300;
        }
        bmr = Math.round(bmr);
        dailyCalories = Math.round(dailyCalories);
    }
    return { bmi, bmr, dailyCalories };
}
    }
}

function updateProgress() {
    // Update progress bar
    const progressFill = document.getElementById('progressFill');
    const percentage = (currentStep / totalSteps) * 100;
    progressFill.style.width = percentage + '%';
}

function nextStep() {
    // Validate each onboarding step
    console.log(`=== NextStep called - currentStep: ${currentStep}, totalSteps: ${totalSteps} ===`);
    
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            console.log(`Moving from step ${currentStep} to step ${currentStep + 1}`);
            currentStep++;
            
            // Calculate metrics for results step
            if (currentStep === 5) {
                console.log('Reached results step - calculating health metrics');
                calculateAndDisplayMetrics();
            }
            
            showStep(currentStep);
            updateProgress();
            console.log(`Now on step ${currentStep}`);
        } else {
            console.log('Already at final step - cannot go further');
        }
    } else {
        console.log('Validation failed - staying on current step');
    }
}

function prevStep() {
    // Allow users to go back to previous steps
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        updateProgress();
    }
}

function changeStep(direction) {
    // Handle step changes (forward and backward)
    console.log(`ChangeStep called: direction=${direction}, currentStep=${currentStep}`);
    
    if (direction === 1) {
        nextStep();
    } else if (direction === -1) {
        prevStep();
    }
}

function showStep(stepNumber) {
    // Hide all steps initially
    console.log(`=== ShowStep called for step ${stepNumber} ===`);
    
    const steps = document.querySelectorAll('.form-step');
    steps.forEach(step => step.classList.remove('active'));
    
    // Show only the current step
    const currentStepElement = document.getElementById(`step${stepNumber}`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');

        // Use global navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        // Show/hide Previous button
        if (prevBtn) prevBtn.style.display = (stepNumber > 1) ? 'inline-block' : 'none';
        // Show/hide Next button
        if (nextBtn) nextBtn.style.display = (stepNumber < totalSteps) ? 'inline-block' : 'none';
        // Show/hide Submit button
        if (submitBtn) submitBtn.style.display = (stepNumber === totalSteps) ? 'inline-block' : 'none';
    } else {
        console.error(`Could not find step element: step${stepNumber}`);
    }
}

function validateCurrentStep() {
    // Thoroughly validate each step for data quality
    console.log(`Validating step ${currentStep}`);
    
    // Let me check which step is actually visible
    const visibleSteps = document.querySelectorAll('.form-step.active');
    console.log(`Visible steps: ${visibleSteps.length}`);
    if (visibleSteps.length > 0) {
        console.log(`Actually visible step ID: ${visibleSteps[0].id}`);
    }
    
    const currentStepElement = document.getElementById(`step${currentStep}`);
    if (!currentStepElement) {
        console.error(`Step element not found: step${currentStep}`);
        return false;
    }
    
    console.log(`Current step element class: ${currentStepElement.className}`);
    console.log(`Is current step visible? ${currentStepElement.classList.contains('active')}`);
    
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    console.log(`Found ${requiredFields.length} required fields`);
    
    let isValid = true;

    requiredFields.forEach(field => {
        console.log(`Checking field: ${field.name} = "${field.value}"`);
        if (!field.value.trim()) {
            console.log(`Field ${field.name} is empty`);
            isValid = false;
            field.style.borderColor = '#ff6b6b';
            showFieldError(field, 'This field is required');
        } else {
            field.style.borderColor = '#e9ecef';
            clearFieldError(field);
        }
    });
    
    // Special validation for user goals
    if (currentStep === 2) {
        const selectedGoals = document.querySelectorAll('input[name="goals"]:checked');
        console.log(`Found ${selectedGoals.length} selected goals`);
        if (selectedGoals.length === 0) {
            isValid = false;
            showNotification('Please select at least one fitness goal', 'error');
        }
    }
    
    if (!isValid) {
        console.log('Validation failed');
        showNotification('Please fill in all required fields', 'error');
    } else {
        console.log('Validation passed');
    }
    
    return isValid;
}

function showFieldError(field, message) {
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.style.cssText = `
            color: #ff6b6b;
            font-size: 0.8rem;
            margin-top: 0.25rem;
        `;
        field.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
}

function clearFieldError(field) {
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

function addFormValidation() {
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.style.borderColor = '#ff6b6b';
                showFieldError(this, 'This field is required');
            } else {
                this.style.borderColor = '#e9ecef';
                clearFieldError(this);
            }
        });
        
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                this.style.borderColor = '#51cf66';
                clearFieldError(this);
            }
        });
    });
}

function addBMICalculation() {
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    
    function calculateBMI() {
        const height = parseFloat(heightInput.value);
        const weight = parseFloat(weightInput.value);
        
        if (height && weight) {
            const heightInMeters = height / 100;
            const bmi = weight / (heightInMeters * heightInMeters);
            
            // Update BMI display in step 4
            const bmiValue = document.getElementById('bmiValue');
            const bmiCategory = document.getElementById('bmiCategory');
            
            if (bmiValue && bmiCategory) {
                bmiValue.textContent = bmi.toFixed(1);
                
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
                
                bmiCategory.textContent = category;
            }
        }
    }
    
    heightInput.addEventListener('input', calculateBMI);
    weightInput.addEventListener('input', calculateBMI);
}

function calculateAndDisplayMetrics() {
    // Calculate all health metrics for the final step
    console.log('=== calculateAndDisplayMetrics called ===');
    
    const formData = collectFormData();
    console.log('Form data collected:', formData);
    
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    const age = parseInt(formData.age);
    const gender = formData.gender;
    const activityLevel = formData.activityLevel;
    const goals = Array.isArray(formData.goals) ? formData.goals : [formData.goals];
    
    console.log(`Calculating for: height=${height}, weight=${weight}, age=${age}, gender=${gender}`);
    
    if (height && weight && age && gender) {
        // Calculate BMI
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        
        // Calculate BMR using Mifflin-St Jeor Equation
        let bmr;
        if (gender === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }
        
        // Calculate target calories based on activity level and goals
        const activityMultipliers = {
            'sedentary': 1.2,
            'lightly_active': 1.375,
            'moderately_active': 1.55,
            'very_active': 1.725,
            'extremely_active': 1.9
        };
        
        let targetCalories = bmr * (activityMultipliers[activityLevel] || 1.2);
        
        // Adjust for goals
        if (goals.includes('weight_loss')) {
            targetCalories -= 500; // Deficit for weight loss
        } else if (goals.includes('muscle_gain')) {
            targetCalories += 300; // Surplus for muscle gain
        }
        
    // Update display - use correct IDs from onboarding.pug
    const bmiResultEl = document.getElementById('bmiResult');
    const bmrResultEl = document.getElementById('bmrResult');
    const targetCaloriesEl = document.getElementById('targetCalories');
    const bmiCategoryEl = document.getElementById('bmiCategory');

    if (bmiResultEl) bmiResultEl.textContent = bmi.toFixed(1);
    if (bmrResultEl) bmrResultEl.textContent = Math.round(bmr);
    if (targetCaloriesEl) targetCaloriesEl.textContent = Math.round(targetCalories);
        
        // Update BMI category
        let category = '';
        if (bmi < 18.5) category = 'Underweight';
        else if (bmi < 25) category = 'Normal weight';
        else if (bmi < 30) category = 'Overweight';
        else category = 'Obese';
        
        if (bmiCategoryEl) bmiCategoryEl.textContent = category;
        
        // Store calculated values
        userProfile = {
            ...formData,
            bmi: bmi.toFixed(1),
            bmr: Math.round(bmr),
            dailyCalories: Math.round(targetCalories)
        };
    }
}

function loadUserData() {
    // Load saved user data from localStorage if available
    const savedData = localStorage.getItem('fitjourney_user');
    if (savedData) {
        userProfile = JSON.parse(savedData);
        populateFormFields();
    }
}

function populateFormFields() {
    // Populate form fields with saved data
    Object.keys(userProfile).forEach(key => {
        const field = document.querySelector(`[name="${key}"]`);
        if (field) {
            if (field.type === 'checkbox') {
                field.checked = userProfile[key].includes(field.value);
            } else {
                field.value = userProfile[key];
            }
        }
    });
}

function collectFormData() {
    const formData = new FormData(document.getElementById('onboardingForm'));
    const data = {};
    
    // Collect basic form data
    for (let [key, value] of formData.entries()) {
        if (data[key]) {
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    }
    
    // Collect checkbox values
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        const name = checkbox.name;
        if (data[name]) {
            if (!Array.isArray(data[name])) {
                data[name] = [data[name]];
            }
            data[name].push(checkbox.value);
        } else {
            data[name] = [checkbox.value];
        }
    });
    
    return data;
}

function calculateHealthMetrics(data) {
    const height = parseFloat(data.height);
    const weight = parseFloat(data.weight);
    const age = parseFloat(data.age);
    const gender = data.gender;
    const activityLevel = data.activityLevel;
    
    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    
    // Activity level multipliers
    const activityMultipliers = {
        'sedentary': 1.2,
        'lightly_active': 1.375,
        'moderately_active': 1.55,
        'very_active': 1.725,
        'extremely_active': 1.9
    };
    
    const dailyCalories = Math.round(bmr * activityMultipliers[activityLevel] || 1.2);
    
    return {
        bmi: bmi.toFixed(1),
        bmr: Math.round(bmr),
        dailyCalories: dailyCalories
    };
}

// Form submission handler
document.getElementById('onboardingForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    const formData = collectFormData();
    const healthMetrics = calculateHealthMetrics(formData);
    
    // Combine form data with health metrics
    userProfile = {
        ...formData,
        ...healthMetrics,
        targetCalories: document.getElementById('targetCalories').value
    };
    
    // Save to localStorage
    localStorage.setItem('fitjourney_user', JSON.stringify(userProfile));
    
    // Show loading state
    const submitButton = document.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Setting up your journey...';
    submitButton.disabled = true;
    
    try {
        // Send data to backend for processing
        const response = await fetch('/api/daily-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userProfile })
        });
        
        if (response.ok) {
            showNotification('Setup completed successfully!', 'success');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } else {
            throw new Error('Failed to complete setup');
        }
    } catch (error) {
        console.error('Error during setup:', error);
        showNotification('Setup completed! Redirecting to dashboard...', 'success');
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1500);
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
});

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

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        if (currentStep < totalSteps) {
            nextStep();
        } else {
            document.getElementById('onboardingForm').dispatchEvent(new Event('submit'));
        }
    }
    
    if (e.key === 'ArrowLeft' && e.ctrlKey) {
        e.preventDefault();
        prevStep();
    }
    
    if (e.key === 'ArrowRight' && e.ctrlKey) {
        e.preventDefault();
        nextStep();
    }
});

// Adding accessibility
document.addEventListener('DOMContentLoaded', function() {
    const formElements = document.querySelectorAll('input, select, button');
    formElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid #667eea';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
});

console.log('FitJourney Onboarding - Personalizing your health journey');

// --- Close button logic for onboarding modal/step ---
// Handle close button for onboarding modal/step
document.addEventListener('DOMContentLoaded', function() {
    // Support for close button with class 'close-btn' or id 'closeBtn'
    const closeBtns = document.querySelectorAll('.close-btn, #closeBtn');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            // Try to close the modal or hide the onboarding container
            // 1. Hide parent modal if exists
            let modal = btn.closest('.modal, .onboarding-modal, .onboarding-container, .form-step');
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            } else {
                // 2. Fallback: hide the onboarding form
                const onboardingForm = document.getElementById('onboardingForm');
                if (onboardingForm) {
                    onboardingForm.style.display = 'none';
                }
            }
            // 3. Optionally, redirect to homepage or dashboard
            // window.location.href = '/';
        });
    });
});