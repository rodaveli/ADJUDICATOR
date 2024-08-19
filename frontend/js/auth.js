// auth.js
let currentUser = null;
let accessToken = null;

window.register = async function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    showLoader();
    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });

        const data = await response.json();
        showMessage('authMessage', data.message, !response.ok);
        if (response.ok) {
            // Automatically log in after successful registration
            await login();
        }
    } catch (error) {
        showMessage('authMessage', 'An error occurred. Please try again.', true);
    } finally {
        hideLoader();
    }
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    showLoader();
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });

        const data = await response.json();
        if (response.ok) {
            accessToken = data.access_token;
            currentUser = username;
            hideElement('loginRegister');
            showElement('mainApp');
            fetchSessions();
            initializeSocket();
        } else {
            showMessage('authMessage', data.message, true);
        }
    } catch (error) {
        showMessage('authMessage', 'An error occurred. Please try again.', true);
    } finally {
        hideLoader();
    }
}

function logout() {
    accessToken = null;
    currentUser = null;
    currentSession = null;
    showElement('loginRegister');
    hideElement('mainApp');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Utility functions (these might be in a separate file in a larger project)
function showElement(id) {
    document.getElementById(id).classList.remove('hidden');
}

function hideElement(id) {
    document.getElementById(id).classList.add('hidden');
}

function showLoader() {
    // Implementation depends on your loader design
    console.log('Loading...');
}

function hideLoader() {
    // Implementation depends on your loader design
    console.log('Loading complete');
}

function showMessage(elementId, message, isError = false) {
    const messageElement = document.getElementById(elementId);
    messageElement.textContent = message;
    messageElement.className = isError ? 'alert alert-danger' : 'alert alert-success';
    messageElement.classList.remove('hidden');
    setTimeout(() => {
        messageElement.classList.add('hidden');
        messageElement.textContent = '';
        messageElement.className = '';
    }, 3000);
}