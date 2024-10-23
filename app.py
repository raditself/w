
import os
from flask import Flask, request, jsonify, send_from_directory
import glob
from flask_cors import CORS
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

@app.route('/load_model', methods=['POST'])
def load_model():
    global model
    data = request.json
    filename = data.get('filename')
    if not filename or not allowed_file(filename):
        return jsonify({'error': 'Invalid file type'}), 400
    
    filepath = os.path.join(MODEL_FOLDER, filename)
    if not os.path.exists(filepath):
        return jsonify({'error': 'Model file not found'}), 404
    
    try:
        model = AutoModelForCausalLM.from_pretrained(filepath)
        initial_greeting = model("Hello! How can I assist you today?")
        return jsonify({'success': 'Model loaded successfully', 'initial_greeting': initial_greeting}), 200
    except Exception as e:
        return jsonify({'error': f'Error loading model: {str(e)}'}), 500

@app.route('/model_status', methods=['GET'])
def model_status():
    global model
    return jsonify({'loaded': model is not None}), 200

@app.route('/models', methods=['GET'])
def list_models():
    model_files = glob.glob(os.path.join(MODEL_FOLDER, '*'))
    model_names = [os.path.basename(f) for f in model_files if allowed_file(f)]
    return jsonify(model_names), 200

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
