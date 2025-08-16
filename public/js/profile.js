// Loads user profile data from localStorage and displays it on the profile page

document.addEventListener('DOMContentLoaded', function() {
  // Try to get user data from localStorage
  const userData = localStorage.getItem('fitjourney_user');
  if (!userData) return;

  const user = JSON.parse(userData);
  // Fill in the profile details if present
  const details = [
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
    { key: 'gender', label: 'Gender' },
    { key: 'height', label: 'Height', suffix: 'cm' },
    { key: 'weight', label: 'Weight', suffix: 'kg' },
    { key: 'activityLevel', label: 'Activity Level' },
    { key: 'goals', label: 'Goals' },
    { key: 'bmi', label: 'BMI' },
    { key: 'bmr', label: 'BMR' },
    { key: 'dailyCalories', label: 'Daily Calories' }
  ];

  const ul = document.querySelector('.profile-details');
  if (!ul) return;
  ul.innerHTML = '';
  details.forEach(item => {
    if (user[item.key] !== undefined && user[item.key] !== null) {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${item.label}:</strong> ${Array.isArray(user[item.key]) ? user[item.key].join(', ') : user[item.key]}${item.suffix ? ' ' + item.suffix : ''}`;
      ul.appendChild(li);
    }
  });
});
