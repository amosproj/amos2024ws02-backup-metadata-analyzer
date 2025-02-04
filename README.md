# AMOS Backup Metadata Analyzer

## Prerequisites

Make sure the following are installed on your machine:

- **Node 20 with npm**
- **Docker**
- **Docker Compose**
- **Python 3.11 and Poetry**

## Build and run

Now you have 2 options:
- 1. Build and run with docker
- 2. Build and run with nx (for local development)

### Docker Build Setup Instructions

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


### Local dev build and run instructions

- use `npm ci` to install local node dependencies
- cd into apps/analyzer/metadata_analyzer directory and run `poetry install` to install python venv and dependencies

- in `apps/backend` and `apps/analyzer`: copy the `.env.example` files and rename them to `.env`
- make sure you have postgres databases running on the connections defined in the `.env` files.
- the analyzer database should contain the database with backup metadata to be analyzed.
- the backend database should initially be empty and is used to store the analysis results.


(Suggestion) Use docker to provide the database(s): 
- if you only want to provide the analyzer database or the backend database via docker, please change the commands accordingly.
- Prepare the .env.docker file (see step 3 of docker setup enstructions)
- `docker compose --env-file .env.docker build --no-cache backendDatabase analyzerDatabase`
- `docker compose --env-file .env.docker up backendDatabase analyzerDatabase`


If you have got the databases running:
- `npm run all` to run all modules at the same time

if you want to run the modules individually:
- `npm run py` to run the python analyzer
- `npm run be` to run the Typescript backend
- `npm run fe` to run the frontend