# Use Alpine 3.17, which supports Python 3.11
#FROM node:18-alpine3.17
FROM python:3.11-slim-buster
#FROM node:18-bullseye
WORKDIR /app
# Install Python 3.11 and other dependencies
#RUN apk add --no-cache python3 py3-pip python3-dev gcc musl-dev libffi-dev openssl-dev bash
#RUN apt-get update && apt-get install -y python3 python3-pip python3-dev gcc libffi-dev libssl-dev bash python3-venv
# Create the virtual environment
#RUN python3 -m venv /app/.venv
COPY pyproject.toml poetry.lock ./
# Set the virtual environment path
#ENV PATH="/app/.venv/bin:$PATH"
RUN python3 -m pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir pipx && \
    pipx ensurepath

# Install Poetry with pipx
RUN pipx install poetry


# Add Poetry to PATH
ENV PATH="/root/.local/bin:$PATH"
# # Install Poetry
# RUN pip install --no-cache --upgrade pip setuptools && \
#     pip install poetry
#     #pip install poetry && \

# Copy the dependency files


# RUN poetry config virtualenvs.create true
# Install dependencies with Poetry
# RUN poetry config virtualenvs.create false && \
#     poetry install --no-interaction --no-ansi
#RUN rm -rf /app/.venv
RUN poetry config virtualenvs.create false
RUN poetry install --no-interaction --no-ansi --verbose
#RUN pip install flask python-dotenv pg8000 sqlalchemy requests flasgger


#Copy the remaining code
COPY . .
#RUN rm -rf /app/.venv
#RUN poetry install --no-interaction --no-ansi --verbose
# Standard command to start the application
#CMD ["/app/.venv/bin/python3", "main.py" , "--host", "0.0.0.0"]
