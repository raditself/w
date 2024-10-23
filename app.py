

import os
import requests
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from ctransformers import AutoModelForCausalLM
from werkzeug.utils import secure_filename
from threading import Thread

app = Flask(__name__, static_folder='..', static_url_path='')
CORS(app)

MODEL_PATH = "stablelm-2-1_6b-chat.Q4_K_M.imx.gguf"
MODEL_URL = "https://huggingface.co/Crataco/stablelm-2-1_6b-chat-imatrix-GGUF/resolve/main/stablelm-2-1_6b-chat.Q4_K_M.imx.gguf"
model = None
download_progress = 0

def download_model():
    global download_progress
    response = requests.get(MODEL_URL, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    block_size = 1024  # 1 KB
    with open(MODEL_PATH, 'wb') as file:
        for data in response.iter_content(block_size):
            size = file.write(data)
            download_progress = int((size / total_size) * 100)

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/check_model', methods=['GET'])
def check_model():
    return jsonify({"model_exists": os.path.exists(MODEL_PATH)})

@app.route('/download_model', methods=['GET'])
def download_model_route():
    if not os.path.exists(MODEL_PATH):
        Thread(target=download_model).start()
        return jsonify({"message": "Model download started"}), 202
    return jsonify({"message": "Model already exists"}), 200

@app.route('/download_progress', methods=['GET'])
def get_download_progress():
    return jsonify({"progress": download_progress})

@app.route('/chat', methods=['POST'])
def chat():
    global model
    if model is None:
        if not os.path.exists(MODEL_PATH):
            return jsonify({"error": "Model not found. Please download the model first."}), 400
        model = AutoModelForCausalLM.from_pretrained(MODEL_PATH, model_type="stablelm")
    
    data = request.json
    user_input = data['message']
    
    response = model(f"Human: {user_input}\nAssistant:", max_new_tokens=100)
    
    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

