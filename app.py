
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from ctransformers import AutoModelForCausalLM
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='..', static_url_path='')
CORS(app)

MODEL_PATH = "stablelm-2-1_6b-chat.Q4_K_M.imx.gguf"
model = None

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/check_model', methods=['GET'])
def check_model():
    return jsonify({"model_exists": os.path.exists(MODEL_PATH)})

@app.route('/upload_model', methods=['POST'])
def upload_model():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file:
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.root_path, MODEL_PATH))
        return jsonify({"message": "Model uploaded successfully"}), 200

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
