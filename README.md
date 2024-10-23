# StableLM Chat Application

This is a simple chat application that uses the StableLM 2 1.6B model for generating responses.

## Project Structure

```
.
├── README.md
├── index.html
├── script.js
├── style.css
├── app.py
```

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/raditself/w.git
   cd w
   ```

2. Install the required packages:
   ```
   pip install flask flask-cors ctransformers requests werkzeug
   ```

3. Run the application:
   ```
   python app.py
   ```

4. Open `http://localhost:5000` in your web browser to start chatting.

5. Download the model:
   The StableLM 2 1.6B model file is not included in this repository due to its large size. When you first open the application, you will see a "Download Model" button. Click this button to download and install the model before you can start chatting.

## Features

- Simple web interface for chatting
- Uses StableLM 2 1.6B model for generating responses
- Manual model download option
- Model status check and display

## Note

This application is for demonstration purposes only and should not be used in production environments without proper security measures.

## Troubleshooting

If you encounter any issues with downloading or running the model, please check the Hugging Face model page for the most up-to-date download link and instructions:
https://huggingface.co/Crataco/stablelm-2-1_6b-chat-imatrix-GGUF

## Development

To make changes to the application:

1. Modify the backend code in `app.py`
2. Update the frontend files: `index.html`, `script.js`, and `style.css`
3. Test your changes locally by running the application
4. Commit your changes and push to GitHub:
   ```
   git add .
   git commit -m "Description of your changes"
   git push origin main
   ```

Enjoy chatting with StableLM!
