# Use Alpine 3.17, which supports Python 3.11
#FROM node:18-alpine3.17
FROM python:3.11-slim-buster

# Install Python 3.11 and other dependencies
#RUN apk add --no-cache python3 py3-pip python3-dev gcc musl-dev libffi-dev openssl-dev bash
RUN apt-get update && apt-get install -y python3 python3-pip python3-dev gcc libffi-dev libssl-dev bash
# Create the virtual environment
RUN python3 -m venv /app/.venv

# Set the virtual environment path
ENV PATH="/app/.venv/bin:$PATH"

# Install Poetry
RUN pip install --no-cache --upgrade pip setuptools && \
    pip install poetry

# Copy the dependency files
WORKDIR /app
COPY pyproject.toml poetry.lock ./

# Install dependencies with Poetry
RUN poetry config virtualenvs.create false && \
    poetry install --no-interaction --no-ansi

#Copy the remaining code
COPY . .

# Standard command to start the application
#CMD ["/app/.venv/bin/python3", "main.py" , "--host", "0.0.0.0"]
