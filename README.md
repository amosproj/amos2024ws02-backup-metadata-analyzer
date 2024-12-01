# AMOS Backup Metadata Analyzer

## Prerequisites

Make sure the following are installed on your machine:

- **Node 20**
- **Docker**
- **Docker Compose**

## Docker Build Setup Instructions

1. **Clone the repository**:

   ```bash
   git clone https://github.com/amosproj/amos2024ws02-backup-metadata-analyzer.git

   ```

2. **Change directory**:

   ```bash
    cd ./amos2024ws02-backup-metadata-analyzer/

   ```

3. **Setup .env files**:

   ```bash
    cp .env.docker.example .env.docker

   ```

4. **Copy database dump into project**:

   Copy the database dump .dmp file in the projects root folder and rename it to **db_dump.sql**

5. **Clean Docker node_modules**:

   ```bash
   docker volume rm amos2024ws02-backup-metadata-analyzer_mono-node-modules
   ```

6. **Build and start Docker container**:

   ```bash
    docker compose --env-file .env.docker up --build

   ```

7. **Stop Docker Container**:
   ```bash
    docker compose --env-file .env.docker down
   ```
