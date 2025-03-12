#!/bin/bash

# Setup Python environment
python -m venv env
source env/bin/activate
pip install -r requirements.txt

# Ensure critical directories exist
mkdir -p backend/static/plots
mkdir -p db

# Initialize database if it doesn't exist
if [ ! -f "db/my_database.db" ]; then
  echo "Initializing database..."
  cp db/my_database_backup.db db/my_database.db 2>/dev/null || true
fi

# Set proper permissions
chmod -R 755 backend
chmod -R 755 frontend
chmod -R 777 db

# Run the Flask application
cd backend
python app.py