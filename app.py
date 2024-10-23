
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from ctransformers import AutoModelForCausalLM

app = Flask(__name__)
CORS(app)

MODEL_FOLDER = 'models'
ALLOWED_EXTENSIONS = {'bin', 'gguf'}

if not os.path.exists(MODEL_FOLDER):
    os.makedirs(MODEL_FOLDER)

model = None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/upload_model', methods=['POST'])
def upload_model():
    global model
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(MODEL_FOLDER, filename)
        file.save(filepath)
        try:
            model = AutoModelForCausalLM.from_pretrained(filepath)
            return jsonify({'success': 'Model uploaded and loaded successfully'}), 200
        except Exception as e:
            return jsonify({'error': f'Error loading model: {str(e)}'}), 500
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/chat', methods=['POST'])
def chat():
    global model
    if not model:
        return jsonify({'error': 'Model not loaded'}), 400
    
    data = request.json
    user_input = data.get('message', '')
    
    try:
        response = model(user_input)
        return jsonify({'response': response}), 200
    except Exception as e:
        return jsonify({'error': f'Error generating response: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
