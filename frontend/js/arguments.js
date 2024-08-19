// arguments.js
window.submitArgument = async function() {
    const content = document.getElementById('argument').value;
    const imageUpload = document.getElementById('imageUpload');

    const formData = new FormData();
    formData.append('session_id', currentSession);
    formData.append('content', content);
    if (imageUpload.files.length > 0) {
        formData.append('image', imageUpload.files[0]);
    }

    showLoader();
    try {
        const response = await fetch('/submit_argument', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            showMessage('authMessage', 'Argument submitted successfully', false);
            document.getElementById('argument').value = '';
            document.getElementById('imageUpload').value = '';
            document.getElementById('imagePreview').innerHTML = '';
            addArgumentToList(data.argument);
        } else {
            showMessage('authMessage', data.message, true);
        }
    } catch (error) {
        showMessage('authMessage', 'An error occurred. Please try again.', true);
    } finally {
        hideLoader();
    }
}

function createArgumentElement(argument) {
    const argumentElement = document.createElement('div');
    argumentElement.className = 'argument';
    argumentElement.id = `argument-${argument.id}`;

    const content = document.createElement('p');
    content.textContent = argument.content;
    argumentElement.appendChild(content);

    if (argument.image_path) {
        const img = document.createElement('img');
        img.src = `/uploads/${argument.image_path}`;
        img.className = 'img-fluid mt-3';
        argumentElement.appendChild(img);
    }

    const timestamp = document.createElement('small');
    timestamp.className = 'text-muted d-block mt-2';
    timestamp.textContent = new Date(argument.timestamp).toLocaleString();
    argumentElement.appendChild(timestamp);

    const replyButton = document.createElement('button');
    replyButton.className = 'btn btn-sm btn-outline-primary mt-2';
    replyButton.textContent = 'Reply';
    replyButton.onclick = () => showReplyForm(argument.id);
    argumentElement.appendChild(replyButton);

    const replyForm = document.createElement('div');
    replyForm.className = 'reply-form mt-3 hidden';
    replyForm.id = `reply-form-${argument.id}`;
    replyForm.innerHTML = `
        <textarea id="reply-${argument.id}" class="form-control" rows="2" placeholder="Enter your reply"></textarea>
        <input type="file" id="reply-image-${argument.id}" class="form-control mt-2" accept="image/*">
        <button onclick="submitReply('${argument.id}')" class="btn btn-primary btn-sm mt-2">Submit Reply</button>
    `;
    argumentElement.appendChild(replyForm);

    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'children mt-3';
    childrenContainer.id = `children-${argument.id}`;
    argumentElement.appendChild(childrenContainer);

    return argumentElement;
}

function addArgumentToList(argument) {
    if (argument.parent_id) {
        const parentContainer = document.getElementById(`children-${argument.parent_id}`);
        if (parentContainer) {
            parentContainer.appendChild(createArgumentElement(argument));
        }
    } else {
        const argumentsList = document.getElementById('argumentsList');
        argumentsList.appendChild(createArgumentElement(argument));
    }
}

function showReplyForm(argumentId) {
    const replyForm = document.getElementById(`reply-form-${argumentId}`);
    replyForm.classList.remove('hidden');
}

async function submitReply(parentId) {
    const content = document.getElementById(`reply-${parentId}`).value;
    const imageUpload = document.getElementById(`reply-image-${parentId}`);

    const formData = new FormData();
    formData.append('session_id', currentSession);
    formData.append('content', content);
    formData.append('parent_id', parentId);
    if (imageUpload.files.length > 0) {
        formData.append('image', imageUpload.files[0]);
    }

    try {
        const response = await fetch('/submit_argument', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            showMessage('authMessage', 'Reply submitted successfully', false);
            document.getElementById(`reply-${parentId}`).value = '';
            imageUpload.value = '';
            document.getElementById(`reply-form-${parentId}`).classList.add('hidden');
            addArgumentToList(data.argument);
        } else {
            showMessage('authMessage', data.message, true);
        }
    } catch (error) {
        showMessage('authMessage', 'An error occurred. Please try again.', true);
    }
}

window.getJudgement = async function() {
    showLoader();
    try {
        const response = await fetch(`/get_judgement/${currentSession}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        document.getElementById('judgement').textContent = data.judgement;
        if (data.ai_question) {
            showElement('aiQuestion');
            document.getElementById('aiQuestionContent').textContent = data.ai_question;
            currentAIQuestion = data.ai_question_id;
        } else {
            hideElement('aiQuestion');
        }
    } catch (error) {
        showMessage('authMessage', 'An error occurred. Please try again.', true);
    } finally {
        hideLoader();
    }
}

async function answerAIQuestion() {
    const answer = document.getElementById('aiAnswer').value;

    showLoader();
    try {
        const response = await fetch('/answer_ai_question', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({question_id: currentAIQuestion, answer: answer})
        });

        const data = await response.json();
        if (response.ok) {
            showMessage('authMessage', 'Answer submitted successfully', false);
            document.getElementById('aiAnswer').value = '';
            hideElement('aiQuestion');
            // Optionally, you can trigger a new judgment request here
            await getJudgement();
        } else {
            showMessage('authMessage', data.message, true);
        }
    } catch (error) {
        showMessage('authMessage', 'An error occurred. Please try again.', true);
    } finally {
        hideLoader();
    }
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

async function getJudgement() {
    showLoader();
    try {
        const response = await fetch(`/get_judgement/${currentSession}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            const judgementElement = document.getElementById('judgement');
            judgementElement.innerHTML = `
                <h3>Judgement</h3>
                <p><strong>Decision:</strong> ${data.decision}</p>
                <p><strong>Reasoning:</strong> ${data.reasoning}</p>
                <p><strong>Confidence Score:</strong> ${data.confidence_score}</p>
            `;
            showElement('judgement');
        } else {
            showMessage('authMessage', data.message, true);
        }
    } catch (error) {
        showMessage('authMessage', 'An error occurred. Please try again.', true);
    } finally {
        hideLoader();
    }
}

async function getAIQuestion() {
    showLoader();
    try {
        const response = await fetch(`/generate_ai_question/${currentSession}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            showElement('aiQuestion');
            document.getElementById('aiQuestionContent').textContent = data.question;
            currentAIQuestion = data.question_id;
        } else {
            showMessage('authMessage', data.message, true);
        }
    } catch (error) {
        showMessage('authMessage', 'An error occurred. Please try again.', true);
    } finally {
        hideLoader();
    }
}