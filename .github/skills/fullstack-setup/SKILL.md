---
name: fullstack-setup
description: "Use when: you need to inspect the backend and frontend folders, install dependencies, create or verify the database, run migrations, launch both services, and verify they start cleanly."
---

# Full-Stack Setup and Verification

Use this workflow when the project needs a fresh local setup or a health check for both the backend and frontend.

## 1. Review the dependency manifests

- Read [backend/requirements.txt](backend/requirements.txt) for the Python packages required by the backend.
- Read [frontend/package.json](frontend/package.json) for the Node packages required by the frontend.
- Go through the folders and check if there are other dependencies used that are not in the list of dependencies in the [backend/requirements.txt](backend/requirements.txt) and [frontend/package.json](frontend/package.json).
- Update the requirements file and Install the backend dependencies from the requirements file.
- Update the package json file and Install the frontend dependencies from the package manifest.

### Backend dependency install

Run these commands from the repository root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Frontend dependency install

Run these commands from the repository root:

```powershell
cd frontend
npm install
```

## 2. Prepare the database

- Make sure PostgreSQL is running locally.
- Create the database if it does not exist.
- Use the database URL from the environment or create a local one that matches the app configuration.

Example:

```powershell
psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname = 'vehicle_booking';"
psql -U postgres -c "CREATE DATABASE vehicle_booking;"
```

If a backend environment file is missing, create one with values for the database and secret keys. The app already expects a database URL in the backend configuration.

## 3. Run database migrations

From the backend folder:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
alembic upgrade head
```

If the migration state is not initialized yet, verify the database exists first and then run the upgrade again. Do not guess the migration state; report the exact failure if it is not available.

## 4. Verify the backend can start

Run the backend in one terminal:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python run.py
```

Expected result:

- The Flask app starts without import errors.
- The server stays running without a stack trace.
- The backend is reachable on <http://127.0.0.1:5000>.

## 5. Verify the frontend can start

Run the frontend in a second terminal:

```powershell
cd frontend
npm run dev
```

Expected result:

- Vite starts successfully.
- The frontend is reachable on <http://127.0.0.1:5173>.
- No build errors appear in the terminal output.

## 6. Run verification checks

Run these checks after the services are installed and started:

### Backend checks

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pytest -q
```

### Frontend checks

```powershell
cd frontend
npm run build
npm run test -- --run
```

### Smoke checks

```powershell
Invoke-WebRequest http://127.0.0.1:5000 -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:5173 -UseBasicParsing
```

## 7. Failure handling

- If dependency installation fails, report the exact package or version error.
- If the database setup fails, stop and fix the PostgreSQL connection or permissions issue first.
- If migrations fail, report the Alembic error before attempting any workaround.
- If either service does not start cleanly, capture the terminal error output and fix the root cause before continuing.
- If you have any clarification question, ask for more clarity.
