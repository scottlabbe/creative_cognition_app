#!/bin/bash
# Setup Python environment
python -m venv env
source env/bin/activate
pip install -r requirements.txt

if [ ! -f "db/my_database.db" ]; then
  echo "Initializing database..."
  cp db/my_database_backup.db db/my_database.db 2>/dev/null || true
fi

# Set proper permissions
chmod -R 755 backend
chmod -R 755 frontend
chmod -R 777 db

# Run the Flask application from its correct location
cd backend
python app.py