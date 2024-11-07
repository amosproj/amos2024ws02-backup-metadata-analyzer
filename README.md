# AMOS Backup Metadata Analyzer


## Prerequisites
Make sure the following are installed on your machine:
- **Node 20**
- **Docker**
- **Docker Compose**

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/amosproj/amos2024ws02-backup-metadata-analyzer.git

2. **Change directory**:
   ```bash
cd ./amos2024ws02-backup-metadata-analyzer/

3. **Setup .env files**:
   ```bash
cp .env.docker.example .env.docker
cp apps/backend/.env.example apps/backend/.env

4. **Docker compose up**:
   ```bash
docker-compose --env-file .env.docker up --build

5. **Docker compose down**:
   ```bash
docker-compose --env-file .env.docker down