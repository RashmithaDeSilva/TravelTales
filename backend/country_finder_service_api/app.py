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


# ------------------------------------------------------------------------------ #
# Hugging Face model setup
# ------------------------------------------------------------------------------ #
custom_cache = os.path.join(os.getcwd(), "hf_cache")
os.environ["HF_HOME"] = custom_cache
os.environ["TRANSFORMERS_CACHE"] = os.path.join(custom_cache, "models")

# Load environment variables from a .env file
load_dotenv()


from transformers import pipeline


# Initialize the classifier
classifier = pipeline("zero-shot-classification", model="valhalla/distilbart-mnli-12-1", device=-1, cache_dir="./hf_cache")

# Load countries list
with open('country_names.json', 'r', encoding='utf-8') as file:
    all_countries = json.load(file)

# ------------------------------------------------------------------------------ #
# Helper functions
# ------------------------------------------------------------------------------ #
def batch_labels(labels, batch_size=25):
    """Split large label lists into smaller batches."""
    return [labels[i:i + batch_size] for i in range(0, len(labels), batch_size)]

# ------------------------------------------------------------------------------ #
# Flask app setup with Swagger
# ------------------------------------------------------------------------------ #
app = Flask(__name__)
CORS(app)

# Set the secret key in Flask config
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET')

swagger = Swagger(app, template={
    "info": {
        "title": "Country Finder API",
        "description": "API for asynchronous country finder zero-shot-classification using valhalla/distilbart-mnli-12-1",
        "version": "1.0"
    },
    "host": "localhost:5000",
    "basePath": "/",
    "schemes": ["http"]
})

# ------------------------------------------------------------------------------ #
# Threading and job management
# ------------------------------------------------------------------------------ #
jobs = {}
job_lock = threading.Lock()

# Executor for prediction (max 10 concurrent)
executor = ThreadPoolExecutor(max_workers=10)

# ------------------------------------------------------------------------------ #
# Job logic
# ------------------------------------------------------------------------------ #
def predict_job(job_id, description):
    """Run the prediction and update the job status/results."""
    with job_lock:
        jobs[job_id]['status'] = 'predicting'

    top_results = []
    for batch in batch_labels(all_countries, 30):
        result = classifier(description, candidate_labels=batch, top_k=3)
        for label, score in zip(result["labels"], result["scores"]):
            top_results.append({"country": label, "confidence": score})
    top_results.sort(key=lambda x: x["confidence"], reverse=True)
    best_3 = [
        {"country": item["country"], "confidence": round(item["confidence"] * 100, 2)}
        for item in top_results[:3]
    ]

    with job_lock:
        jobs[job_id]['status'] = 'done'
        jobs[job_id]['result'] = best_3
        jobs[job_id]['timestamp'] = time.time()

def cleanup_jobs():
    """Continuously remove completed jobs after 5 minutes."""
    while True:
        time.sleep(30)  # check every 30 seconds
        now = time.time()
        with job_lock:
            expired = [job_id for job_id, data in jobs.items() if data['status'] == 'done' and now - data['timestamp'] > 300]
            for job_id in expired:
                del jobs[job_id]

# Start cleanup thread
cleanup_thread = threading.Thread(target=cleanup_jobs, daemon=True)
cleanup_thread.start()

# ------------------------------------------------------------------------------ #
# Flask endpoints
# ------------------------------------------------------------------------------ #
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
    Submit a new country prediction job.
    ---
    tags:
      - Prediction
    summary: Submit a description to predict top matching countries.
    description: >
      Accepts a description text and returns a job ID.
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
              example: "A cold snowy place with high mountains and glaciers"
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
              example: "Description cannot be empty"
    415:
      description: Unsupported content type.
      schema:
        type: object
        properties:
          error:
            type: string
            example: "Content-Type must be application/json"
    """
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415

    try:
        data = request.get_json()
    except Exception:
        return jsonify({"error": "Malformed JSON body"}), 400

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid JSON structure"}), 400

    description = data.get("description")
    if not isinstance(description, str) or not description.strip():
        return jsonify({"error": "Description must be a non-empty string"}), 400

    description = description.strip()
    job_id = str(uuid.uuid4())

    with job_lock:
        jobs[job_id] = {
            "status": "waiting",
            "result": {},
            "timestamp": None
        }

    executor.submit(predict_job, job_id, description)

    return jsonify({"job_id": job_id, "status": "waiting"}), 200

@app.route("/result/<job_id>", methods=["GET"])
@token_required
def get_result(job_id):
    """
    Retrieve prediction result for a specific job.
    ---
    tags:
      - Prediction
    summary: Get job status and result using job ID.
    description: >
      Returns the current status of the prediction job.
      If completed, the predicted countries and their confidence levels will be included.
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
              type: array
              items:
                type: object
                properties:
                  country:
                    type: string
                    example: "Norway"
                  confidence:
                    type: number
                    format: float
                    example: 97.65
      404:
        description: Job not found or expired.
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Job ID not found"
    """
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
    summary: Get API status
    description: Returns the operational status of the API.
    responses:
      200:
        description: Successful response with status
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: boolean
                  example: true
    """
    return jsonify({ "status": True })

# ------------------------------------------------------------------------------ #
# Graceful shutdown handling with manual timeout
# ------------------------------------------------------------------------------ #
def shutdown_handler(sig, frame):
    """Gracefully shutdown the Flask app and background threads."""
    print("Shutting down gracefully...")

    # Setting a timeout for thread shutdown
    stop_event = threading.Event()

    def shutdown_executor_with_timeout():
        """Shutdown the executors with a timeout (grace period for threads to finish)."""
        try:
            # Shut down prediction executor
            executor._threads.clear()  # Clear the threads in the pool
            # Manually wait for cleanup tasks
            cleanup_thread.join(timeout=5)  # Give cleanup thread 5 seconds to finish
            stop_event.set()  # Mark the event as done
        except Exception as e:
            print(f"Error during shutdown: {e}")

    # Start shutdown process in a separate thread
    shutdown_thread = threading.Thread(target=shutdown_executor_with_timeout)
    shutdown_thread.start()

    # Wait for a maximum of 5 seconds before forcibly stopping
    stop_event.wait(timeout=5)
    if not stop_event.is_set():
        print("Timeout reached, forcing shutdown...")
        sys.exit(0)

    sys.exit(0)

# Register SIGINT (Ctrl+C) to trigger graceful shutdown
signal.signal(signal.SIGINT, shutdown_handler)

# ------------------------------------------------------------------------------ #
# Start the server
# ------------------------------------------------------------------------------ #
if __name__ == "__main__":
    # Disable reloader to avoid creating an extra thread for Flask's development server
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)
