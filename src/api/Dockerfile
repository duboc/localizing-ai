# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
# Prevents Python from writing pyc files to disc (recommended)
ENV PYTHONDONTWRITEBYTECODE 1
# Ensures Python output is sent straight to terminal (recommended)
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Install system dependencies if needed (e.g., for libraries that require C extensions)
# RUN apt-get update && apt-get install -y --no-install-recommends some-package && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
# Copy only requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
# Note: This assumes vertex_libs.py and main.py are the only Python files needed.
# If there were more files/subdirectories in src/api, adjust the COPY command.
COPY vertex_libs.py .
COPY main.py .
# If you add other .py files or directories within src/api, add COPY lines for them here.

# Expose the port the app runs on (using 8000 to match local development)
# Cloud Run automatically uses the PORT environment variable, but exposing is good practice.
EXPOSE 8000

# Define the command to run the application
# Use gunicorn for production deployments is often recommended, but uvicorn is simpler for now.
# Cloud Run sets the PORT env var, which Uvicorn respects by default when host is 0.0.0.0.
# Using port 8000 explicitly ensures consistency if PORT env var isn't set locally.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
