import os
import json
import uuid
import time
import threading
from flask import Flask, request, jsonify
from werkzeug.exceptions import HTTPException
from flask_cors import CORS
from flasgger import Swagger
from concurrent.futures import ThreadPoolExecutor
import signal
import sys
import jwt
from dotenv import load_dotenv
from functools import wraps


# ------------------------------------------------------------------------------
# Hugging Face model setup
# ------------------------------------------------------------------------------
os.environ["TORCH_HOME"] = "./model_cache"
os.environ["HF_HOME"] = "./hf_cache"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

# Load environment variables from a .env file
load_dotenv()

from detoxify import Detoxify
model = Detoxify('original')  # or 'multilingual'

# ------------------------------------------------------------------------------
# Flask app setup with Swagger
# ------------------------------------------------------------------------------
app = Flask(__name__)
CORS(app)

# Set the secret key in Flask config
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET')

swagger = Swagger(app, template={
    "info": {
        "title": "Toxicity Detection API",
        "description": "API for asynchronous text toxicity classification using Detoxify",
        "version": "1.0"
    },
    "host": "localhost:5001",
    "basePath": "/",
    "schemes": ["http"]
})

# ------------------------------------------------------------------------------
# Threading and job management
# ------------------------------------------------------------------------------
jobs = {}
job_lock = threading.Lock()
executor = ThreadPoolExecutor(max_workers=10)

def predict_job(job_id, description):
    """Run the prediction and update the job status/results."""
    with job_lock:
        jobs[job_id]['status'] = 'predicting'

    raw_results = model.predict(description)
    # Convert NumPy float32 to native Python float
    results = {k: float(v) for k, v in raw_results.items()}

    with job_lock:
        jobs[job_id]['status'] = 'done'
        jobs[job_id]['result'] = results
        jobs[job_id]['timestamp'] = time.time()

def cleanup_jobs():
    """Continuously remove completed jobs after 5 minutes."""
    while True:
        time.sleep(30)
        now = time.time()
        with job_lock:
            expired = [job_id for job_id, data in jobs.items()
                       if data['status'] == 'done' and now - data['timestamp'] > 300]
            for job_id in expired:
                del jobs[job_id]

# Start cleanup thread
cleanup_thread = threading.Thread(target=cleanup_jobs, daemon=True)
cleanup_thread.start()

# ------------------------------------------------------------------------------
# Flask endpoints
# ------------------------------------------------------------------------------
@app.errorhandler(HTTPException)
def handle_http_exception(e):
    response = e.get_response()
    response.data = jsonify({"error": e.description}).data
    response.content_type = "application/json"
    return response, e.code

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        SECRET_KEY = app.config['JWT_SECRET']

        # Check if Authorization header is present
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Token is missing"}), 401

        try:
            jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)
    return decorated

@app.route("/predict", methods=["POST"])
@token_required
def predict_endpoint():
    """
    Submit a new text for toxicity prediction.
    ---
    tags:
      - Prediction
    summary: Submit a text for toxicity prediction
    description: >
      Accepts a text input and returns a job ID.
      The job is processed asynchronously and can be retrieved using `/result/<job_id>`.
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - description
          properties:
            description:
              type: string
              example: "You are the worst person ever"
    responses:
      200:
        description: Job successfully submitted.
        schema:
          type: object
          properties:
            job_id:
              type: string
              example: "b1fc03a9-9450-41ad-9217-2fa188c44d09"
            status:
              type: string
              example: "waiting"
      400:
        description: Invalid or missing input.
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Description must be a non-empty string"
      415:
        description: Content-Type must be application/json.
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Content-Type must be application/json"
    """
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415

    data = request.get_json()

    description = data.get("description", "")
    if not isinstance(description, str) or not description.strip():
        return jsonify({"error": "Description must be a non-empty string"}), 400

    job_id = str(uuid.uuid4())
    with job_lock:
        jobs[job_id] = {
            "status": "waiting",
            "result": {},
            "timestamp": None
        }

    executor.submit(predict_job, job_id, description.strip())
    return jsonify({"job_id": job_id, "status": "waiting"})

@app.route("/result/<job_id>", methods=["GET"])
@token_required
def get_result(job_id):
    """
    Retrieve prediction result for a specific job.
    ---
    tags:
      - Prediction
    summary: Get job status and result using job ID
    description: >
      Returns the current status of the prediction job.
      If completed, the toxicity scores will be included.
    parameters:
      - name: job_id
        in: path
        required: true
        type: string
        description: The job ID returned by the `/predict` endpoint.
    responses:
      200:
        description: Job status (and result if completed).
        schema:
          type: object
          properties:
            job_id:
              type: string
            status:
              type: string
              enum: [waiting, predicting, done]
            result:
              type: object
              additionalProperties:
                type: number
                format: float
              example:
                toxicity: 0.123
                severe_toxicity: 0.045
                obscene: 0.078
      404:
        description: Job not found or invalid.
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Job ID not found"
    """
    try:
        uuid.UUID(job_id)  # Validate UUID format
    except (ValueError, TypeError):
        return jsonify({"error": "Job ID not found"}), 404

    with job_lock:
        job = jobs.get(job_id)

    if not job:
        return jsonify({"error": "Job ID not found"}), 404

    return jsonify({
        "job_id": job_id,
        "status": job["status"],
        "result": job["result"] if job["status"] == "done" else {}
    })

@app.route("/status", methods=["GET"])
def get_status():
    """
    Get API status
    ---
    tags:
      - Utility
    summary: Get API status
    description: Returns the operational status of the API.
    responses:
      200:
        description: Successful response with status
        schema:
          type: object
          properties:
            status:
              type: boolean
              example: true
    """
    return jsonify({"status": True})

# ------------------------------------------------------------------------------
# Graceful shutdown
# ------------------------------------------------------------------------------
def shutdown_handler(sig, frame):
    """Gracefully shutdown the Flask app and background threads."""
    print("Shutting down gracefully...")
    stop_event = threading.Event()

    def shutdown_executor_with_timeout():
        try:
            executor._threads.clear()
            cleanup_thread.join(timeout=5)
            stop_event.set()
        except Exception as e:
            print(f"Error during shutdown: {e}")

    shutdown_thread = threading.Thread(target=shutdown_executor_with_timeout)
    shutdown_thread.start()

    stop_event.wait(timeout=5)
    if not stop_event.is_set():
        print("Timeout reached, forcing shutdown...")
        sys.exit(0)
    sys.exit(0)

signal.signal(signal.SIGINT, shutdown_handler)

# ------------------------------------------------------------------------------
# Start server
# ------------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5001, use_reloader=False)
