# Analyzer Readme
## Setup
- install poetry (https://python-poetry.org/)
- `poetry install`: run command in the analyzer directory to install dependencies
- copy `.env.example` to `.env` and adjust database parameters
- `npm run py`: run analyzer individually
- `nx run metadata-analyzer:test`: run analyzer tests
- if flask imports are not recognized, potential vscode problem: strg + shift + p -> Select Interpreter -> Enter Interpreter Path -> (select python that lies in .venv directory)

## Structure
### Outer main.py
- Is executed to start the analyzer
- Calls main.py in the metadata_analyzer module

### main.py
- Runs the flask server and defines the endpoints
- Uses Swagger via flasgger
- Initializes the analyzer

### backend.py
- Provides functions for interacting with the backend

### database.py
- Provides functions for interacting with the database

### models.py
- Defines the used models for the database

### *_alert.py
- Provide the classes for initializing, storing and converting the different types of alerts

### analyzer.py
- Is called from main.py and delegates the analysis requests to a specific analyzer
- Also provides a function to update the basic backup data of the backend

### simple_rule_based_analyzer.py
- Specific analyzer for the creation of size alerts and creation date alerts 
- Uses simple heuristics to generate those alerts

### schedule_based_analyzer.py
- Specific analyzer for the creation of missing, additional and creation date alerts
- Uses schedules and task_events to try to predict the points in time where schedules should have been made
- l. 107 and l. 130 contain code that probably should be changed when analyzing a live database and not dumps

### enhanced_storage_analyzer.py
- Specific analyzer for estimating when a datastore could potentially overflow
- the amount of time to look into the future (steps * frequency) can be adjusted
- not all datastore overflow times can be forecast due to missing or mismatched data
- uses an AutoARIMA model
- trigger via swagger endpoint, results are passed to backend and displayed in frontend

### time_series_analyzer.py
- Specific analyzer for identifying outliers in storage size
- Quality of results varies greatly depending on parameter fit to data set, some parameters must be adjusted for specific backups
- uses basic k-means analysis
- trigger via swagger endpoint

## Development
- `poetry add <dependency-name>`: add a new dependency
- `poetry remove <dependency-name>`: remove a dependency
- `black` is used for formatting
