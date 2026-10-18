# Base image
FROM python:3.12-slim

# Working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the service code and the trained model
COPY app.py /app/
COPY models /app/models

# FastAPI port
EXPOSE 5000

# Start the service
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]
