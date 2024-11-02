# Build, user, and technical documentation

Software architecture description

## Basic setup:

```bash
npm ci
cd ./apps/analyzer/metadata_analyzer ; poetry install
```

- `npm ci`: dependency install
- copy `.env.example` file and rename to `.env` (adjust database properties according to database setup if necessary)

### Running the code locally:

- `npm run be`: run backend individually
- `npm run fe`: run frontend individually
- `npm run both`: run backend and frontend
- `npm run py` : run python app

### Generating database migrations:

- the entity files need to be annotated with `@Entity(<table-name>)`
- append the entity file to the `entities` array in `db-config.service.ts`
- run the following command to generate a migration file:
  - `nx run metadata-analyzer-backend:migrations:generate --name <migration-name>`
- append the generated file to the `migrations` array in `db-config.service.ts`



## Installing new dependencies

### in python app

When working with python dependencies, first cd into the `analyzer` folder.

#### Install a new dependency

`poetry add <dependency-name>`

#### Remove a dependency

`poetry remove <dependency-name>`