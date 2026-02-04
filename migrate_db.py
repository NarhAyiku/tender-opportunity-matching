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
    """Add new columns to user_swipes, users, and opportunities tables."""
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

        cursor.execute("PRAGMA table_info(opportunities)")
        opp_columns = [col[1] for col in cursor.fetchall()]

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
        if 'age' not in user_columns:
            print("Adding 'age' column to users...")
            cursor.execute("ALTER TABLE users ADD COLUMN age INTEGER")
        if 'location' not in user_columns:
            print("Adding 'location' column to users...")
            cursor.execute("ALTER TABLE users ADD COLUMN location TEXT")
        if 'preferred_countries' not in user_columns:
            print("Adding 'preferred_countries' column to users...")
            cursor.execute("ALTER TABLE users ADD COLUMN preferred_countries JSON")
        if 'screening_completed' not in user_columns:
            print("Adding 'screening_completed' column to users...")
            cursor.execute("ALTER TABLE users ADD COLUMN screening_completed BOOLEAN DEFAULT 0")
        if 'screening_completed_at' not in user_columns:
            print("Adding 'screening_completed_at' column to users...")
            cursor.execute("ALTER TABLE users ADD COLUMN screening_completed_at DATETIME")
        if 'consent_share_documents' not in user_columns:
            print("Adding 'consent_share_documents' column to users...")
            cursor.execute("ALTER TABLE users ADD COLUMN consent_share_documents BOOLEAN DEFAULT 0")

        # Add columns to opportunities table
        if 'source' not in opp_columns:
            print("Adding 'source' column to opportunities...")
            cursor.execute("ALTER TABLE opportunities ADD COLUMN source TEXT DEFAULT 'internal'")
        if 'external_id' not in opp_columns:
            print("Adding 'external_id' column to opportunities...")
            cursor.execute("ALTER TABLE opportunities ADD COLUMN external_id TEXT")
        if 'external_url' not in opp_columns:
            print("Adding 'external_url' column to opportunities...")
            cursor.execute("ALTER TABLE opportunities ADD COLUMN external_url TEXT")
        if 'refreshed_at' not in opp_columns:
            print("Adding 'refreshed_at' column to opportunities...")
            cursor.execute("ALTER TABLE opportunities ADD COLUMN refreshed_at DATETIME")
        if 'is_stale' not in opp_columns:
            print("Adding 'is_stale' column to opportunities...")
            cursor.execute("ALTER TABLE opportunities ADD COLUMN is_stale BOOLEAN DEFAULT 0")
        if 'location' not in opp_columns:
            print("Adding 'location' column to opportunities...")
            cursor.execute("ALTER TABLE opportunities ADD COLUMN location TEXT")
        if 'job_type' not in opp_columns:
            print("Adding 'job_type' column to opportunities...")
            cursor.execute("ALTER TABLE opportunities ADD COLUMN job_type TEXT")
        if 'url' not in opp_columns:
            print("Adding 'url' column to opportunities...")
            cursor.execute("ALTER TABLE opportunities ADD COLUMN url TEXT")
        if 'created_at' not in opp_columns:
            print("Adding 'created_at' column to opportunities...")
            cursor.execute("ALTER TABLE opportunities ADD COLUMN created_at DATETIME")
        if 'company' not in opp_columns:
            print("Adding 'company' column to opportunities...")
            cursor.execute("ALTER TABLE opportunities ADD COLUMN company TEXT")

        # Unique index for source + external_id (ignores NULL external_id rows)
        print("Ensuring unique index on opportunities(source, external_id)...")
        cursor.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS uq_opportunity_source_external "
            "ON opportunities(source, external_id) "
            "WHERE external_id IS NOT NULL"
        )

        conn.commit()
        print("\nMigration completed successfully!")
        print("\nNew columns added:")
        print("  user_swipes: status, preview_data, edited_data, swipe_date")
        print("  users: daily_swipe_limit, age, location, preferred_countries, screening_completed, screening_completed_at, consent_share_documents")
        print("  opportunities: source, external_id, external_url, refreshed_at, is_stale, location, job_type, url, created_at, company")

    except sqlite3.Error as e:
        conn.rollback()
        print(f"\nMigration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    print("Starting database migration...")
    migrate()
