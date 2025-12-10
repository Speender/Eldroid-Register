// admin_login.js - Handles Admin Login Logic

const API_URL = 'http://localhost:3001/api';

const adminUsernameInput = document.getElementById('adminUsername');
const adminPasswordInput = document.getElementById('adminPassword');
const adminLoginBtn = document.getElementById('admin-login-btn');
const messageAlert = document.getElementById('message-alert');

function showMessage(type, text) {
    messageAlert.className = `message ${type}`;
    messageAlert.innerHTML = `<span>${text}</span>`;
    messageAlert.classList.remove('hidden');
    setTimeout(() => {
        messageAlert.classList.add('hidden');
    }, 4000);
}

async function handleAdminLogin() {
    const username = adminUsernameInput.value.trim();
    const password = adminPasswordInput.value.trim();

    if (!username || !password) {
        showMessage('error', 'Please enter admin username and password.');
        return;
    }

    adminLoginBtn.disabled = true;
    adminLoginBtn.textContent = 'Logging in...';

    try {
        const response = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Mark user as logged in as admin
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            window.location.href = 'admin_view.html'; // Redirect to dashboard

        } else {
            showMessage('error', data.error || 'Admin login failed.');
        }
    } catch (error) {
        showMessage('error', 'Failed to connect to server.');
        console.error('Admin Login error:', error);
    } finally {
        adminLoginBtn.disabled = false;
        adminLoginBtn.textContent = 'Login as Admin';
    }
}

// Event Listeners
adminLoginBtn.addEventListener('click', handleAdminLogin);