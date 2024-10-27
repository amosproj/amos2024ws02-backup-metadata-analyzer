Build, user, and technical documentation
Software architecture description

basic setup:

- `npm ci`: dependency install
- copy `.env.example` file and rename to `.env` (adjust database properties according to database setup if necessary)

running the code locally:

- `npm run be`: run backend individually
- `npm run fe`: run frontend individually
- `npm run both`: run backend and frontend

generating database migrations:

- the entity files need to be annotated with `@Entity(<table-name>)`
- append the entity file to the `entities` array in `db-config.service.ts`
- run the following command to generate a migration file:
    - `nx run metadata-analyzer-backend:migrations:generate --name <migration-name>`
- append the generated file to the `migrations` array in `db-config.service.ts`