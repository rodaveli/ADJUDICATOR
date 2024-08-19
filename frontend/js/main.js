let currentUser = null;
let currentSession = null;
let accessToken = null;
let currentAIQuestion = null;
let socket = null;

function showElement(id) {
    document.getElementById(id).classList.remove('hidden');
}

function hideElement(id) {
    document.getElementById(id).classList.add('hidden');
}

function showLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    document.body.appendChild(loader);
}

function hideLoader() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.remove();
    }
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

// Event listener for image upload
document.getElementById('imageUpload').addEventListener('change', handleImageUpload);

function handleImageUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'img-fluid mt-3';
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.innerHTML = '';
        imagePreview.appendChild(img);
    }

    reader.readAsDataURL(file);
}

// Add these function definitions at the end of the file

async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showMessage('authMessage', 'Please enter both username and password', true);
        return;
    }

    showLoader();
    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            showMessage('authMessage', 'Registration successful. Please log in.', false);
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        } else {
            showMessage('authMessage', data.message || 'Registration failed', true);
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

    if (!username || !password) {
        showMessage('authMessage', 'Please enter both username and password', true);
        return;
    }

    showLoader();
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            accessToken = data.access_token;
            showMessage('authMessage', 'Login successful', false);
            document.getElementById('loginRegister').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');
            loadUserSessions();
        } else {
            showMessage('authMessage', data.message || 'Login failed', true);
        }
    } catch (error) {
        showMessage('authMessage', 'An error occurred. Please try again.', true);
    } finally {
        hideLoader();
    }
}

async function createSession() {
    const title = document.getElementById('sessionTitle').value;

    if (!title) {
        showMessage('authMessage', 'Please enter a session title', true);
        return;
    }

    showLoader();
    try {
        const response = await fetch('/create_session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ title })
        });

        const data = await response.json();
        if (response.ok) {
            showMessage('authMessage', 'Session created successfully', false);
            document.getElementById('sessionTitle').value = '';
            await fetchSessions();
            loadSession(data.session_id, title);
        } else {
            showMessage('authMessage', data.message, true);
        }
    } catch (error) {
        showMessage('authMessage', 'An error occurred. Please try again.', true);
    } finally {
        hideLoader();
    }
}

async function inviteUser() {
    const username = document.getElementById('inviteUsername').value;
    if (!username) {
        showMessage('authMessage', 'Please enter a username to invite', true);
        return;
    }

    showLoader();
    try {
        const response = await fetch('/invite_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ session_id: currentSession, username: username })
        });

        const data = await response.json();
        if (response.ok) {
            showMessage('authMessage', `User ${username} invited successfully`, false);
            document.getElementById('inviteUsername').value = '';
        } else {
            if (data.message === "User not found") {
                // If user is not found, offer to send an email invitation
                if (confirm(`User ${username} not found. Would you like to send an email invitation?`)) {
                    await sendEmailInvitation(username);
                }
            } else {
                showMessage('authMessage', data.message, true);
            }
        }
    } catch (error) {
        showMessage('authMessage', 'An error occurred. Please try again.', true);
    } finally {
        hideLoader();
    }
}

async function sendEmailInvitation(email) {
    try {
        const response = await fetch('/send_email_invitation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ session_id: currentSession, email: email })
        });

        const data = await response.json();
        if (response.ok) {
            showMessage('authMessage', `Invitation email sent to ${email}`, false);
        } else {
            showMessage('authMessage', data.message, true);
        }
    } catch (error) {
        showMessage('authMessage', 'Failed to send email invitation. Please try again.', true);
    }
}

function submitArgument() {
    // Implementation for submitting an argument
    console.log('Submit argument function called');
    // You'll need to implement the actual argument submission logic here
}

function getJudgement() {
    // Implementation for getting a judgement
    console.log('Get judgement function called');
    // You'll need to implement the actual judgement retrieval logic here
}