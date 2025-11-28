// script.js - Vanilla JavaScript Frontend

const API_URL = 'http://192.168.1.14:3001/api';

// DOM Elements
const formInputs = {
    studentId: document.getElementById('studentId'), // Added ID No. input
    lastName: document.getElementById('lastName'),
    firstName: document.getElementById('firstName'),
    course: document.getElementById('course'),
    yearLevel: document.getElementById('yearLevel')
};
const submitButton = document.getElementById('submit-btn');
const messageAlert = document.getElementById('message-alert');
const messageText = document.getElementById('message-text');
const countNumber = document.getElementById('count-number');

// Icons (Lucide SVGs for Check and AlertCircle)
const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>`;
const alertCircleIcon = `<svg xmlns="http://www.w3.0/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`;

/**
 * Displays an alert message.
 * @param {string} type - 'success' or 'error'.
 * @param {string} text - The message content.
 */
function showMessage(type, text) {
    // Clear existing classes and content
    messageAlert.className = 'message';
    messageAlert.innerHTML = '';

    // Set new type class and content
    messageAlert.classList.add(type);
    messageAlert.classList.remove('hidden');
    
    const icon = type === 'success' ? checkIcon : alertCircleIcon;
    messageAlert.insertAdjacentHTML('beforeend', icon);
    messageAlert.insertAdjacentHTML('beforeend', `<span>${text}</span>`);

    // Hide message after 3 seconds
    setTimeout(() => {
        messageAlert.classList.add('hidden');
    }, 3000);
}

/**
 * Loads the list of registered students and updates the count.
 */
async function loadStudents() {
    try {
        const response = await fetch(`${API_URL}/students`);
        const data = await response.json();
        if (data.success) {
            countNumber.textContent = data.students.length;
        } else {
            console.error('Failed to load students:', data.error);
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

/**
 * Handles the student registration form submission.
 */
async function handleSubmit() {
    const formData = {
        studentId: formInputs.studentId.value.trim(), // Added ID No. to formData
        lastName: formInputs.lastName.value.trim(),
        firstName: formInputs.firstName.value.trim(),
        course: formInputs.course.value.trim(),
        yearLevel: formInputs.yearLevel.value // Select value is the year number
    };

    // Simple validation (updated to include studentId)
    if (!formData.studentId || !formData.lastName || !formData.firstName || !formData.course || !formData.yearLevel) {
        showMessage('error', 'Please fill in all fields');
        return;
    }

    // Set loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Registering...';

    try {
        const response = await fetch(`${API_URL}/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('success', 'Student registered successfully!');
            // Clear form (updated to include studentId)
            formInputs.studentId.value = '';
            formInputs.lastName.value = '';
            formInputs.firstName.value = '';
            formInputs.course.value = '';
            formInputs.yearLevel.value = ''; // Reset select
            await loadStudents(); // Reload count
        } else {
            showMessage('error', data.error || 'Registration failed');
        }
    } catch (error) {
        showMessage('error', 'Failed to connect to server');
        console.error('Error registering student:', error);
    } finally {
        // Reset loading state
        submitButton.disabled = false;
        submitButton.textContent = 'Register Student';
    }
}

// Attach event listeners
submitButton.addEventListener('click', handleSubmit);

// Initial load
document.addEventListener('DOMContentLoaded', loadStudents);