# Base image
FROM python:3.12-slim

# System updates and user creation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && useradd -ms /bin/bash appuser \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory and copy files
WORKDIR /app
COPY . /app

# Change ownership to new user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Install Python dependencies
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Expose app port
EXPOSE 5000

# Run the app
CMD ["python", "app.py"]
