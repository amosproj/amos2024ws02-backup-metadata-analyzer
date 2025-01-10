# Use Alpine 3.17, which supports Python 3.11

FROM python:3.11-slim-buster

WORKDIR /app

COPY . .
RUN rm -rf .venv
# COPY pyproject.toml poetry.lock ./

#Install Python and Pipx
RUN python3 -m pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir pipx && \
    pipx ensurepath

# Install PostgreSQL client
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Poetry with pipx
RUN pipx install poetry

# Add Poetry to PATH
ENV PATH="/root/.local/bin:$PATH"

#Install dependencies outside of the venv
# RUN poetry config virtualenvs.create true
RUN poetry config virtualenvs.create true
RUN poetry config virtualenvs.in-project true
RUN poetry install --no-interaction --no-ansi --verbose || echo "Poetry installation failed"
# RUN poetry install --no-interaction --no-ansi --verbose --no-root

# Activate virtual environment and set it in PATH
ENV PATH="/app/.venv/bin:$PATH"

# RUN python3 -m pip install --no-cache-dir flask

#Copy the remaining code
# COPY . .

