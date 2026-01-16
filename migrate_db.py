"""
Database migration script to add new columns for QualityMatch features.
Run this script to update your SQLite database with the new fields.

Usage:
    python migrate_db.py

Note: This script will add new columns to existing tables. 
For production, consider using Alembic for proper migrations.
"""
import sqlite3
import os
from pathlib import Path

# Database path
DB_PATH = Path(__file__).parent / "app.db"

def migrate():
    """Add new columns to user_swipes and users tables."""
    if not DB_PATH.exists():
        print(f"Database not found at {DB_PATH}")
        print("Creating new database...")
        # If database doesn't exist, it will be created by SQLAlchemy on first run
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(user_swipes)")
        swipe_columns = [col[1] for col in cursor.fetchall()]
        
        cursor.execute("PRAGMA table_info(users)")
        user_columns = [col[1] for col in cursor.fetchall()]

        # Add columns to user_swipes table
        if 'status' not in swipe_columns:
            print("Adding 'status' column to user_swipes...")
            cursor.execute("ALTER TABLE user_swipes ADD COLUMN status TEXT DEFAULT 'pending'")
        
        if 'preview_data' not in swipe_columns:
            print("Adding 'preview_data' column to user_swipes...")
            cursor.execute("ALTER TABLE user_swipes ADD COLUMN preview_data TEXT")
        
        if 'edited_data' not in swipe_columns:
            print("Adding 'edited_data' column to user_swipes...")
            cursor.execute("ALTER TABLE user_swipes ADD COLUMN edited_data TEXT")
        
        if 'swipe_date' not in swipe_columns:
            print("Adding 'swipe_date' column to user_swipes...")
            cursor.execute("ALTER TABLE user_swipes ADD COLUMN swipe_date DATE")
            # Set default value for existing rows
            cursor.execute("UPDATE user_swipes SET swipe_date = DATE(created_at) WHERE swipe_date IS NULL")

        # Add column to users table
        if 'daily_swipe_limit' not in user_columns:
            print("Adding 'daily_swipe_limit' column to users...")
            cursor.execute("ALTER TABLE users ADD COLUMN daily_swipe_limit INTEGER DEFAULT 50")
            # Set default value for existing users
            cursor.execute("UPDATE users SET daily_swipe_limit = 50 WHERE daily_swipe_limit IS NULL")

        conn.commit()
        print("\nMigration completed successfully!")
        print("\nNew columns added:")
        print("  user_swipes: status, preview_data, edited_data, swipe_date")
        print("  users: daily_swipe_limit")

    except sqlite3.Error as e:
        conn.rollback()
        print(f"\nMigration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    print("Starting database migration...")
    migrate()
