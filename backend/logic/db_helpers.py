# logic/db_helpers.py

import sqlite3

DATABASE_FILE = "my_database.db"  # or wherever your DB is

def get_connection():
    """Return a new DB connection. Caller should close() it."""
    conn = sqlite3.connect(DATABASE_FILE)
    return conn