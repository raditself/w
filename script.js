
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const downloadButton = document.getElementById('download-button');
const downloadStatus = document.getElementById('download-status');
const modelStatus = document.getElementById('model-status');
const chatContainer = document.getElementById('chat-container');
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
    downloadStatus.textContent = 'Downloading model...';
    downloadButton.disabled = true;
    try {
        const response = await fetch('https://huggingface.co/Crataco/stablelm-2-1_6b-chat-imatrix-GGUF/resolve/main/stablelm-2-1_6b-chat.Q4_K_M.imx.gguf');
        const blob = await response.blob();
        const formData = new FormData();
        formData.append('file', blob, 'stablelm-2-1_6b-chat.Q4_K_M.imx.gguf');
        
        await fetch('http://localhost:5000/upload_model', {
            method: 'POST',
            body: formData
        });
        
        downloadStatus.textContent = 'Model downloaded successfully';
        await checkModelStatus();
    } catch (error) {
        console.error('Error downloading model:', error);
        downloadStatus.textContent = 'Error downloading model';
        downloadButton.disabled = false;
    }
});

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (message) {
        addMessage('user', message);
        userInput.value = '';
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
            console.error('Error:', error);
            addMessage('bot', 'Sorry, there was an error processing your request.');
        }
    }
});

function addMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.textContent = text;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Check model status on page load
checkModelStatus();
