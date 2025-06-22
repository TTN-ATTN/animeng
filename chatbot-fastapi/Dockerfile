FROM python:3.12

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TRANSFORMERS_CACHE="/root/.cache/huggingface" \
    HF_HOME="/root/.cache/huggingface"

RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    git \
    libmagic1 \
    swig \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY ./app /app

RUN mkdir -p /root/.cache/huggingface && \
    chmod -R 777 /root/.cache

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
