
let model = null;

document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const uploadButton = document.getElementById('upload-model');
    const modelFile = document.getElementById('model-file');

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    uploadButton.addEventListener('click', uploadModel);

    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage('user', message);
            userInput.value = '';
            if (model) {
                getBotResponse(message);
            } else {
                addMessage('bot', 'Please upload a model first.');
            }
        }
    }

    function addMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function uploadModel() {
        const file = modelFile.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('model', file);

            try {
                const response = await fetch('/upload_model', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    model = result;
                    addMessage('bot', 'Model uploaded successfully.');
                    if (result.initial_greeting) {
                        addMessage('bot', result.initial_greeting);
                    }
                } else {
                    addMessage('bot', 'Failed to upload the model. Please try again.');
                }
            } catch (error) {
                console.error('Error uploading model:', error);
                addMessage('bot', 'An error occurred while uploading the model. Please try again.');
            }
        } else {
            addMessage('bot', 'Please select a model file to upload.');
        }
    }

    async function getBotResponse(message) {
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message })
            });

            if (response.ok) {
                const data = await response.json();
                addMessage('bot', data.response);
            } else {
                addMessage('bot', 'Sorry, I encountered an error while processing your message.');
            }
        } catch (error) {
            console.error('Error getting bot response:', error);
            addMessage('bot', 'An error occurred while getting the response. Please try again.');
        }
    }
});
