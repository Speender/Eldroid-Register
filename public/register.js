// register.js - Handles Student Registration

const API_URL = 'http://localhost:3001/api';

const formInputs = {
    studentId: document.getElementById('studentId'),
    password: document.getElementById('password'),
    lastName: document.getElementById('lastName'),
    firstName: document.getElementById('firstName'),
    course: document.getElementById('course'),
    yearLevel: document.getElementById('yearLevel')
};
const submitButton = document.getElementById('submit-btn');
const messageAlert = document.getElementById('message-alert');

function showMessage(type, text) {
    messageAlert.className = `message ${type}`;
    messageAlert.innerHTML = `<span>${text}</span>`;
    messageAlert.classList.remove('hidden');
    setTimeout(() => {
        messageAlert.classList.add('hidden');
    }, 4000);
}

async function handleSubmit() {
    const formData = {
        studentId: formInputs.studentId.value.trim(),
        password: formInputs.password.value.trim(),
        lastName: formInputs.lastName.value.trim(),
        firstName: formInputs.firstName.value.trim(),
        course: formInputs.course.value,
        yearLevel: formInputs.yearLevel.value
    };

    if (!formData.studentId || !formData.password || !formData.lastName || 
        !formData.firstName || !formData.course || !formData.yearLevel) {
        showMessage('error', 'Please fill in all fields');
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Registering...';

    try {
        const response = await fetch(`${API_URL}/students/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('success', 'Registration Successful! Redirecting...');
            
            // Save data for the next page, INCLUDING the QR code image
            sessionStorage.setItem('registrationSuccessData', JSON.stringify({
                firstName: formData.firstName,
                studentId: formData.studentId,
                qrCodeImage: data.qrCodeImage // <--- This contains the base64 image
            }));

            setTimeout(() => {
                window.location.href = 'student_info.html';
            }, 1000);

        } else {
            showMessage('error', data.error || 'Registration failed');
            submitButton.disabled = false;
            submitButton.textContent = 'Register Student';
        }
    } catch (error) {
        showMessage('error', 'Failed to connect to server');
        console.error(error);
        submitButton.disabled = false;
        submitButton.textContent = 'Register Student';
    }
}

submitButton.addEventListener('click', handleSubmit);