# Hugging Face Spaces Dockerfile for NeuroLens AI Service
FROM python:3.10

# Create user to run the app
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Set working directory
WORKDIR /app

# Install pip requirements first to cache them
COPY --chown=user ./requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Clean huggingface cache occasionally
ENV HF_HOME="/home/user/.cache/huggingface"

# Copy the rest of the app code
COPY --chown=user . /app

# Run FastAPI app
CMD ["uvicorn", "deepfake_api:app", "--host", "0.0.0.0", "--port", "7860"]
