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

   In the projects root folder, copy the **.env.docker.example** and rename the copy to **.env.docker**


4. **Copy database dump into project**:

   Copy the database dump .dmp file into the projects root folder and rename it to **db_dump.sql**

5. **Build  Docker container**:

   ```bash
    docker compose --env-file .env.docker build --no-cache

   ```

6. **Start Docker container**:

   ```bash
    docker compose --env-file .env.docker up

   ```

7. **Stop Docker Container**:
   ```bash
    docker compose --env-file .env.docker down
   ```
