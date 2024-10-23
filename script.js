
document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const modelSelect = document.getElementById('model-select');

    let modelLoaded = false;

    // Fetch available models
    fetch('/models')
        .then(response => response.json())
        .then(models => {
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                modelSelect.appendChild(option);
            });
        });

    modelSelect.addEventListener('change', () => {
        const selectedModel = modelSelect.value;
        if (selectedModel) {
            loadModel(selectedModel);
        }
    });

    function loadModel(filename) {
        fetch('/load_model', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filename: filename }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                modelLoaded = true;
                addMessage('AI', data.initial_greeting);
            } else {
                alert('Error loading model: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error loading model');
        });
    }

    sendBtn.addEventListener('click', sendMessage);
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
            alert('Please select and load a model first.');
        }
    }

    function addMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
