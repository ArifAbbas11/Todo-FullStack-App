#!/bin/bash
set -e

echo "===== Application Startup at $(date '+%Y-%m-%d %H:%M:%S') ====="

# Function to check if a table exists
table_exists() {
    psql "$DATABASE_URL" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='$1');"
}

# Function to check if alembic_version table exists
alembic_version_exists() {
    psql "$DATABASE_URL" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='alembic_version');"
}

echo "Checking database state..."

# Check if alembic_version table exists
if [ "$(alembic_version_exists)" = "t" ]; then
    echo "✓ Alembic version table found. Running migrations..."
    alembic upgrade head
else
    echo "⚠ Alembic version table not found."

    # Check if users table exists (indicating database has been initialized)
    if [ "$(table_exists 'users')" = "t" ]; then
        echo "✓ Database tables already exist. Stamping current version..."
        # Mark all migrations as applied without running them
        alembic stamp head
        echo "✓ Database marked as up-to-date."
    else
        echo "✓ Fresh database detected. Running initial migrations..."
        alembic upgrade head
    fi
fi

echo "✓ Database migrations complete."
echo "Starting FastAPI server on port 7860..."

# Start the FastAPI application
exec uvicorn src.main:app --host 0.0.0.0 --port 7860
