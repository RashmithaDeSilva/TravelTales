import os

# Correctly override both config and model storage locations
os.environ["HF_HOME"] = os.path.join(os.getcwd(), "hf_cache")
os.environ["TRANSFORMERS_CACHE"] = os.path.join(os.getcwd(), "hf_cache", "models")

from transformers import pipeline

# Load zero-shot classification model
classifier = pipeline("zero-shot-classification", model="valhalla/distilbart-mnli-12-1", device=-1)
# -1        CPU (force no GPU)
#  0        First GPU (cuda:0)
#  1, 2     Use specific GPU (if >1 GPUs)

# Full list of country names (example subset here)
all_countries = ["Canada", "Australia", "Germany", "Japan", "India", "France", "Indonesia"]

# Split list into smaller batches
def batch_labels(labels, batch_size=30):
    return [labels[i:i+batch_size] for i in range(0, len(labels), batch_size)]

# Input user description
description = "experiencing the serene beaches of Bali"

# Find best matching country
best_score = 0
best_country = None

for batch in batch_labels(all_countries, 30):
    result = classifier(description, candidate_labels=batch, top_k=1)
    if result["scores"][0] > best_score:
        best_score = result["scores"][0]
        best_country = result["labels"][0]

# Output result
print("Prediction:", best_country)
print("Score:", round(best_score, 4))
