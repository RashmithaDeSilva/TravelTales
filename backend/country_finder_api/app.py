import os

# Set cache path BEFORE importing anything from Hugging Face
custom_cache = os.path.join(os.getcwd(), "hf_cache")
os.environ["HF_HOME"] = custom_cache
os.environ["TRANSFORMERS_CACHE"] = os.path.join(custom_cache, "models")  # Optional redundancy

from flask import Flask, request, jsonify
from transformers import pipeline

# Load model
classifier = pipeline("zero-shot-classification", model="valhalla/distilbart-mnli-12-1", device=-1)

# Load full list of countries (example placeholder – replace with full list)
all_countries = [
    "Canada", "Australia", "Germany", "Japan", "India", "France", "Indonesia", "United Kingdom",
    "United States", "Brazil", "Mexico", "China", "Russia", "South Africa", "Italy", "Spain", "Thailand",
    # ... Add all 195+ countries here
]

# Split country list into smaller batches (e.g., 25 at a time)
def batch_labels(labels, batch_size=25):
    return [labels[i:i + batch_size] for i in range(0, len(labels), batch_size)]

# Set up Flask app
app = Flask(__name__)

@app.route("/predict", methods=["POST"])
def predict_country():
    data = request.json
    description = data.get("description", "")

    # Validate input
    if not description.strip():
        return jsonify({"error": "Description cannot be empty"}), 400

    top_results = []

    # Classify in batches and collect top results
    for batch in batch_labels(all_countries, 30):
        result = classifier(description, candidate_labels=batch, top_k=3)
        for label, score in zip(result["labels"], result["scores"]):
            top_results.append({
                "country": label,
                "confidence": score
            })

    # Sort all results and pick the top 3 overall
    top_results.sort(key=lambda x: x["confidence"], reverse=True)
    best_3 = top_results[:3]

    # Format output
    formatted = [
        {"country": item["country"], "confidence": round(item["confidence"] * 100, 2)}
        for item in best_3
    ]

    # Response
    return jsonify({
        "description": description,
        "predict": formatted
    })

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
