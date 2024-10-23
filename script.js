
document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const uploadButton = document.getElementById('upload-model');
    const modelFile = document.getElementById('model-file');
    const modelStatus = document.getElementById('model-status');

    let modelLoaded = false;

    uploadButton.addEventListener('click', () => {
        const file = modelFile.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            fetch('/upload_model', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    modelLoaded = true;
                    modelStatus.textContent = 'Model loaded';
                    modelStatus.className = 'status-loaded';
                    addMessage('System', 'Model loaded successfully. You can start chatting now.');
                } else {
                    alert('Error uploading model: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error uploading model');
            });
        } else {
            alert('Please select a model file first.');
        }
    });

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const message = userInput.value.trim();
        if (message && modelLoaded) {
            addMessage('You', message);
            userInput.value = '';

            fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message }),
            })
            .then(response => response.json())
            .then(data => {
                addMessage('AI', data.response);
            })
            .catch(error => {
                console.error('Error:', error);
                addMessage('AI', 'Sorry, there was an error processing your request.');
            });
        } else if (!modelLoaded) {
            alert('Please upload and load a model first.');
        }
    }

    function addMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
