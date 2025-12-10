// admin_register.js - Handles Admin Registration

const API_URL = 'http://localhost:3001/api';

const adminKeyInput = document.getElementById('adminKey');
const adminUsernameInput = document.getElementById('adminUsername');
const adminPasswordInput = document.getElementById('adminPassword');
const registerBtn = document.getElementById('admin-register-btn');
const messageAlert = document.getElementById('message-alert');

function showMessage(type, text) {
    messageAlert.className = `message ${type}`;
    messageAlert.innerHTML = `<span>${text}</span>`;
    messageAlert.classList.remove('hidden');
    setTimeout(() => {
        messageAlert.classList.add('hidden');
    }, 4000);
}

async function handleAdminRegister() {
    const adminKey = adminKeyInput.value.trim();
    const username = adminUsernameInput.value.trim();
    const password = adminPasswordInput.value.trim();

    if (!adminKey || !username || !password) {
        showMessage('error', 'All fields are required.');
        return;
    }

    registerBtn.disabled = true;
    registerBtn.textContent = 'Registering...';

    try {
        const response = await fetch(`${API_URL}/admin/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminKey, username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('success', data.message);
            // Redirect to ADMIN LOGIN after successful registration
            setTimeout(() => {
                window.location.href = 'admin_login.html'; // <--- UPDATED THIS LINE
            }, 1500);

        } else {
            showMessage('error', data.error || 'Registration failed.');
        }
    } catch (error) {
        showMessage('error', 'Failed to connect to server.');
        console.error('Admin Registration error:', error);
    } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = 'Register Admin';
    }
}

registerBtn.addEventListener('click', handleAdminRegister);