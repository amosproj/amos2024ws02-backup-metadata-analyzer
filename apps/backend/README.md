# Backend Readme
## Setup
- `npm ci`: dependency install
- copy `.env.example` file in backend and rename to `.env` (adjust database properties according to database setup if necessary)
- `npm run be`: run backend individually
- `nx run metadata-analyzer-backend:test`: Run backend tests

## Backend Structure
- `src/app`: contains the main application
- Utility functionality is located in the `src/app/utils` folder
- migrations are located in the `migrations` folder, DO NOT Touch them and do not create them manually
- `db-config.service.ts`: contains the configuration for the database connection
- The other directories contain the different modules of the application

### Modules
- Controller: Defines the endpoints
- Service: Contains the logic
- Module: Contains the configuration for the module (defines imports and exports)
- Dto directory: Contains the data transfer objects
- Entity directory: Contains the entities for the database

#### BackupData
- Stores the backup data we need to display in the frontend
- Multiple Endpoints for delivering Backups to frontend with filter, sorting and pagination functionality
- Endpoints for preparing chart data for the frontend

#### Data Stores
- Stores the data stores we need to display in the frontend
- Stores also the estimated storage overflow time for each data store

#### Tasks
- Stores the tasks according to the backup data
- We need this for filtering and sorting in the frontend

#### Information
- Delivers general facts about the number of backups

#### Alerting
- Stores the alert types we have (e.g. Size Alerts)
- All Alert Types have to be named as followed [...]_ALERT and the according Table has to be named [...]Alert (camelCase)
- Each Alert Type has its own repository
- Each Alert Type has a severity (INFO, WARNING, CRITICAL) and can be deactivated by user and master (via endpoint)
- All alert entities extend the Alert Entity, which contains the common fields for all alerts
- The alerts are being created via api calls from the analyzer

#### Analyzer Service
- Provides endpoint for refresh, which triggers the analysis of the analyzer via api calls
- Waits until the calls return -> analysis is finished -> frontend request new data via api calls
- Doesn't trigger Overflow Time Calculation, because it lasts too long

#### Backup Alerts Overview
- Delivers the status of the backups (OK, INFO, WARNING, CRITICAL)

#### Utils: Mail
- Handles the mailing functionality
- Contains the mail templates
- Handles the dynamic Mail Receiver Functionality

#### Utils: Pagination
- Handles the pagination functionality
- Contains generic pagination functionality, which can be used for every repository
- Contains specific pagination functionality for alerting (Because of complexity):
    - Pagination for all alert types and therefore all alert repositories
    - Offers filter and order functionality for alerting

## Backend Development
### Generating database migrations:
- the entity files need to be annotated with `@Entity(<table-name>)`
- append the entity file to the `entities` array in `db-config.service.ts`
- run the following command to generate a migration file:
    - `nx run metadata-analyzer-backend:migrations:generate --name <migration-name>`
- append the generated file to the `migrations` array in `db-config.service.ts`
- DO NOT Delete any migration files, which have been already applied to the database -> just create a new migration, which reverts the changes of the migration you want to delete

### Mailing
Fill the `.env` file with the mailing information
Hint: For gmail you have to generate an app password, which you have to use as password in the `.env` file
For changes in templates being used, you have to restart the backend



