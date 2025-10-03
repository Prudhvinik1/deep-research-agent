# Dockerfile for Deep Research Assistant Backend

# Use the appropriate base image for Python and FastAPI
FROM python:3.9

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code into the container
COPY src/ ./src/

# Copy environment file (you'll need to provide this)
# COPY .env.local .env.local

# Expose the port the FastAPI app will run on
EXPOSE 8000

# Run the FastAPI application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]