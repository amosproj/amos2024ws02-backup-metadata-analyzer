# Frontend Readme
## Setup
- `npm ci`: dependency install
- `npm run fe`: run frontend individually
- `nx run metadata-analyzer-frontend:test`: Run frontend tests

## Application Structure

### Main Application Structure (`src/app/`)
The application is organized into several main areas.

#### Pages
Core application pages that represent main routing endpoints:

```markdown
src/app/
├── alert-page/               # Alert overview page
├── backup-statistics-page/   # Statistical analysis and reporting of backups
└── backups-overview-page/    # Main backup overview and dashboard
```

#### Management (`management/`)
Contains components and services for alert configuration and notifications:

```markdown
management/
├── components/
│   ├── notification-settings/      # Alert configuration settings
│   └── email-receiver-settings/    # Email notification management
└── services/                       # Management-related services
```

#### Shared Resources (`shared/`)
Centralized location for shared resources used throughout the application:

- **charts**: Centralized chart logic and visualization components
  - All chart configurations and custom visualizations
  - Reusable chart components

- **components**: Cross-cutting UI components
  - Reusable across different parts of the application
  - contains loading-overlay, filter-side-panel and confirm-dialog

- **enums**: Application-wide enumerations
  - Type definitions for various aspects of the system

- **types**: TypeScript interfaces and type definitions
  - Shared data structures for all neccessary structures

- **utils**: Helper functions and utilities
  - Common formatting functions for alerts and date format

- **services**: Backend API integration
  - RESTful service endpoints
  - Data fetching and manipulation from backend
