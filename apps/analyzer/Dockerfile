# Use Alpine 3.17, which supports Python 3.11

FROM python:3.11-slim-buster

WORKDIR /app

COPY pyproject.toml poetry.lock ./

#Install Python and Pipx
RUN python3 -m pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir pipx && \
    pipx ensurepath

# Install Poetry with pipx
RUN pipx install poetry

# Add Poetry to PATH
ENV PATH="/root/.local/bin:$PATH"

#Install dependencies outside of the venv
RUN poetry config virtualenvs.create false
RUN poetry install --no-interaction --no-ansi --verbose

#Copy the remaining code
COPY . .

# Standard command to start the application
#CMD ["python3", "main.py" , "--host", "0.0.0.0"]
