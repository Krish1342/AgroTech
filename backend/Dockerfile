FROM python:3.10-slim

WORKDIR /app

# install build deps and pip packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy app code
COPY . .

EXPOSE 8000

# Run uvicorn (override in docker run if needed)
CMD ["uvicorn", "demo_api:app", "--host", "0.0.0.0", "--port", "8000"]
