FROM python:3.11-slim

WORKDIR /app

# Install system deps for python-magic (optional)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libmagic-dev \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p uploads

EXPOSE 3002

CMD ["gunicorn", "--bind", "0.0.0.0:3002", "server:app", "--workers", "1"]
