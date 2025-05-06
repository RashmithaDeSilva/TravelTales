import os

# Set both Torch and HuggingFace cache directories to your project
os.environ["TORCH_HOME"] = "./model_cache"
os.environ["HF_HOME"] = "./hf_cache"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"  # optional, suppress warning


from detoxify import Detoxify


# Use 'original', 'unbiased', or 'multilingual'
model = Detoxify('original')  # or Detoxify('multilingual')
result = model.predict("This cuntry is a disgusting cuntry.")

print(result)
