// login.js - Handles Student Login Only

const API_URL = 'http://localhost:3001/api';

// Student Form Elements
const studentIdInput = document.getElementById('studentId');
const studentPasswordInput = document.getElementById('studentPassword');
const studentLoginBtn = document.getElementById('student-login-btn');
const messageAlert = document.getElementById('message-alert');

function showMessage(type, text) {
    messageAlert.className = `message ${type}`;
    messageAlert.innerHTML = `<span>${text}</span>`;
    messageAlert.classList.remove('hidden');
    setTimeout(() => {
        messageAlert.classList.add('hidden');
    }, 4000);
}

// --- STUDENT LOGIN LOGIC ---

async function handleStudentLogin() {
    const studentId = studentIdInput.value.trim();
    const password = studentPasswordInput.value.trim();

    if (!studentId || !password) {
        showMessage('error', 'Please enter both ID and password.');
        return;
    }

    studentLoginBtn.disabled = true;
    studentLoginBtn.textContent = 'Logging in...';

    try {
        const response = await fetch(`${API_URL}/students/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Save student data for the next page
            sessionStorage.setItem('studentData', JSON.stringify(data.student));
            window.location.href = 'student_info.html'; // Redirect to student info page

        } else {
            showMessage('error', data.error || 'Login failed.');
        }
    } catch (error) {
        showMessage('error', 'Failed to connect to server.');
        console.error('Student Login error:', error);
    } finally {
        studentLoginBtn.disabled = false;
        studentLoginBtn.textContent = 'Login as Student';
    }
}

// Event Listeners
studentLoginBtn.addEventListener('click', handleStudentLogin);