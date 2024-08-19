// sessions.js
let currentSession = null;

window.createSession = async function() {
    const title = document.getElementById('sessionTitle').value;

    showLoader();
    try {
        const response = await fetch('/create_session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({title})
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

    showLoader();
    try {
        const response = await fetch('/invite_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({session_id: currentSession, username: username})
        });

        const data = await response.json();
        showMessage('authMessage', data.message, !response.ok);
        if (response.ok) {
            document.getElementById('inviteUsername').value = '';
        }
    } catch (error) {
        showMessage('authMessage', 'An error occurred. Please try again.', true);
    } finally {
        hideLoader();
    }
}

async function fetchSessions() {
    showLoader();
    try {
        const response = await fetch('/get_sessions', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const sessions = await response.json();
        const sessionList = document.getElementById('sessionList');
        sessionList.innerHTML = '';
        sessions.forEach(session => {
            const sessionElement = document.createElement('a');
            sessionElement.className = 'list-group-item list-group-item-action';
            sessionElement.textContent = session.title;
            sessionElement.onclick = () => loadSession(session.id, session.title);
            sessionList.appendChild(sessionElement);
        });
    } catch (error) {
        showMessage('authMessage', 'Failed to fetch sessions. Please try again.', true);
    } finally {
        hideLoader();
    }
}

async function loadSession(sessionId, sessionTitle) {
    currentSession = sessionId;
    document.getElementById('currentSessionTitle').textContent = sessionTitle;
    showElement('currentSession');
    socket.emit('join', { room: sessionId });

    // Fetch existing arguments
    try {
        const response = await fetch(`/get_arguments/${sessionId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const arguments = await response.json();

        // Clear existing arguments
        document.getElementById('argumentsList').innerHTML = '';

        // Add arguments to the list
        arguments.forEach(argument => addArgumentToList(argument));
    } catch (error) {
        showMessage('authMessage', 'Failed to load arguments. Please try again.', true);
    }
}