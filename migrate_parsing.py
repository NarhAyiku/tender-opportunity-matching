"""
Migration script for Milestone 2: Parsing Pipeline.
Creates 'documents' and 'parsed_documents' tables.
"""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "app.db"

def migrate():
    print("Starting Parsing Pipeline migration...")
    
    if not DB_PATH.exists():
        print(f"Database {DB_PATH} not found. Ensure app has run at least once.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Create documents table
        print("Creating 'documents' table...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type VARCHAR NOT NULL,
            filename VARCHAR NOT NULL,
            stored_filename VARCHAR NOT NULL,
            mime_type VARCHAR NOT NULL,
            size_bytes INTEGER NOT NULL,
            storage_url VARCHAR NOT NULL,
            sha256_hash VARCHAR NOT NULL,
            is_default BOOLEAN DEFAULT 1,
            version INTEGER DEFAULT 1,
            uploaded_at DATETIME NOT NULL,
            deleted_at DATETIME,
            latest_parse_id INTEGER,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(latest_parse_id) REFERENCES parsed_documents(id)
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_documents_user_id ON documents (user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_documents_id ON documents (id);")

        # Create parsed_documents table
        print("Creating 'parsed_documents' table...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS parsed_documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            source_type VARCHAR NOT NULL,
            raw_text TEXT NOT NULL,
            parsed_json JSON NOT NULL,
            confidence_scores JSON NOT NULL,
            status VARCHAR NOT NULL,
            error_message TEXT,
            created_at DATETIME NOT NULL,
            FOREIGN KEY(document_id) REFERENCES documents(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_parsed_documents_document_id ON parsed_documents (document_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_parsed_documents_user_id ON parsed_documents (user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_parsed_documents_id ON parsed_documents (id);")

        conn.commit()
        print("Migration completed successfully!")

    except sqlite3.Error as e:
        conn.rollback()
        print(f"Migration failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
