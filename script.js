


const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const downloadButton = document.getElementById('download-button');
const downloadStatus = document.getElementById('download-status');
const modelStatus = document.getElementById('model-status');
const chatContainer = document.getElementById('chat-container');
const loadingIndicator = document.getElementById('loading-indicator');
const shrinkButton = document.createElement('button');
shrinkButton.textContent = 'Shrink';
shrinkButton.id = 'shrink-button';
chatContainer.insertBefore(shrinkButton, chatContainer.firstChild);

shrinkButton.addEventListener('click', () => {
    chatContainer.classList.toggle('shrink');
    shrinkButton.textContent = chatContainer.classList.contains('shrink') ? 'Expand' : 'Shrink';
});

async function checkModelStatus() {
    try {
        const response = await fetch('http://localhost:5000/check_model');
        const data = await response.json();
        if (data.model_exists) {
            modelStatus.textContent = 'Model is ready';
            sendButton.disabled = false;
            downloadButton.style.display = 'none';
        } else {
            modelStatus.textContent = 'Model not found. Please download.';
            sendButton.disabled = true;
            downloadButton.style.display = 'block';
        }
    } catch (error) {
        console.error('Error checking model status:', error);
        modelStatus.textContent = 'Error checking model status';
    }
}

downloadButton.addEventListener('click', async () => {
    downloadStatus.textContent = 'Starting download...';
    downloadButton.disabled = true;
    try {
        const response = await fetch('http://localhost:5000/download_model');
        if (response.ok) {
            trackDownloadProgress();
        } else {
            throw new Error('Failed to start download');
        }
    } catch (error) {
        console.error('Error starting model download:', error);
        downloadStatus.textContent = 'Error starting model download';
        downloadButton.disabled = false;
    }
});

async function trackDownloadProgress() {
    const intervalId = setInterval(async () => {
        try {
            const response = await fetch('http://localhost:5000/download_progress');
            const data = await response.json();
            downloadStatus.textContent = `Downloading: ${data.progress}%`;
            if (data.progress === 100) {
                clearInterval(intervalId);
                downloadStatus.textContent = 'Download complete';
                await checkModelStatus();
            }
        } catch (error) {
            console.error('Error tracking download progress:', error);
            clearInterval(intervalId);
            downloadStatus.textContent = 'Error tracking download progress';
            downloadButton.disabled = false;
        }
    }, 1000);
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (message) {
        addMessage('user', message);
        userInput.value = '';
        loadingIndicator.style.display = 'block';
        try {
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });
            const data = await response.json();
            if (data.error) {
                addMessage('bot', data.error);
            } else {
                addMessage('bot', data.response);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            addMessage('bot', 'Error: Unable to get response');
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }
});

function addMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

checkModelStatus();


