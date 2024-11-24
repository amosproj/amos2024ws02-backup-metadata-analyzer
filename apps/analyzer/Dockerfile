# Verwende Alpine 3.17, das Python 3.11 unterstützt
FROM node:18-alpine3.17

# Installiere Python 3.11 und weitere Abhängigkeiten
RUN apk add --no-cache python3 py3-pip python3-dev gcc musl-dev libffi-dev openssl-dev bash

# Erstelle die virtuelle Umgebung
RUN python3 -m venv /app/.venv

# Setze den virtuellen Umgebungs-Pfad
ENV PATH="/app/.venv/bin:$PATH"

# Installiere Poetry
RUN pip install --no-cache --upgrade pip setuptools && \
    pip install poetry

# Kopiere die Abhängigkeitsdateien
WORKDIR /app
COPY pyproject.toml poetry.lock ./

# Installiere Abhängigkeiten mit Poetry
RUN poetry config virtualenvs.create false && \
    poetry install --no-interaction --no-ansi

# Kopiere den restlichen Code
COPY . .

# Standardbefehl zum Starten der Anwendung
CMD ["/app/.venv/bin/python3", "main.py" , "--host", "0.0.0.0"]
