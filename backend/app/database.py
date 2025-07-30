# backend/app/database.py
import sqlite3
import os
from datetime import datetime
from contextlib import contextmanager
from typing import Dict, Optional, List

# Database file location
DB_PATH = os.path.join(os.path.dirname(__file__), "linkshield.db")

def init_database():
    """Initialize the database with required tables."""
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        
        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # URL scans table for history
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS url_scans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                url TEXT NOT NULL,
                result TEXT NOT NULL,
                confidence REAL,
                scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        # User profiles table for additional profile data
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_profiles (
                user_id INTEGER PRIMARY KEY,
                bio TEXT,
                location TEXT,
                website TEXT,
                avatar_url TEXT,
                preferences TEXT, -- JSON string for user preferences
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        conn.commit()
        print("Database initialized successfully")

@contextmanager
def get_db_connection():
    """Context manager for database connections."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # This allows accessing columns by name
    try:
        yield conn
    finally:
        conn.close()

class UserDatabase:
    """Database operations for user management."""
    
    @staticmethod
    def create_user(name: str, email: str, hashed_password: str) -> Optional[Dict]:
        """Create a new user in the database."""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO users (name, email, hashed_password)
                    VALUES (?, ?, ?)
                """, (name, email, hashed_password))
                
                user_id = cursor.lastrowid
                conn.commit()
                
                # Create empty profile for the user
                cursor.execute("""
                    INSERT INTO user_profiles (user_id)
                    VALUES (?)
                """, (user_id,))
                conn.commit()
                
                return {
                    "id": str(user_id),
                    "name": name,
                    "email": email,
                    "created_at": datetime.utcnow()
                }
        except sqlite3.IntegrityError:
            return None  # User already exists
        except Exception as e:
            print(f"Error creating user: {e}")
            return None
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict]:
        """Retrieve a user by email."""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT id, name, email, hashed_password, created_at
                    FROM users
                    WHERE email = ?
                """, (email,))
                
                row = cursor.fetchone()
                if row:
                    return {
                        "id": str(row["id"]),
                        "name": row["name"],
                        "email": row["email"],
                        "hashed_password": row["hashed_password"],
                        "created_at": row["created_at"]
                    }
                return None
        except Exception as e:
            print(f"Error retrieving user: {e}")
            return None
    
    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[Dict]:
        """Retrieve a user by ID."""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT id, name, email, created_at
                    FROM users
                    WHERE id = ?
                """, (int(user_id),))
                
                row = cursor.fetchone()
                if row:
                    return {
                        "id": str(row["id"]),
                        "name": row["name"],
                        "email": row["email"],
                        "created_at": row["created_at"]
                    }
                return None
        except Exception as e:
            print(f"Error retrieving user by ID: {e}")
            return None
    
    @staticmethod
    def update_user_profile(user_id: str, name: Optional[str] = None, email: Optional[str] = None) -> bool:
        """Update user profile information."""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                
                update_fields = []
                params = []
                
                if name:
                    update_fields.append("name = ?")
                    params.append(name)
                
                if email:
                    update_fields.append("email = ?")
                    params.append(email)
                
                if not update_fields:
                    return True
                
                update_fields.append("updated_at = CURRENT_TIMESTAMP")
                params.append(int(user_id))
                
                query = f"""
                    UPDATE users
                    SET {', '.join(update_fields)}
                    WHERE id = ?
                """
                
                cursor.execute(query, params)
                conn.commit()
                
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Error updating user profile: {e}")
            return False

class ScanDatabase:
    """Database operations for URL scan history."""
    
    @staticmethod
    def save_scan(user_id: str, url: str, result: str, confidence: Optional[float] = None) -> bool:
        """Save a URL scan result."""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO url_scans (user_id, url, result, confidence)
                    VALUES (?, ?, ?, ?)
                """, (int(user_id) if user_id else None, url, result, confidence))
                
                conn.commit()
                return True
        except Exception as e:
            print(f"Error saving scan: {e}")
            return False
    
    @staticmethod
    def get_user_scan_history(user_id: str, limit: int = 10) -> List[Dict]:
        """Get scan history for a user."""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT url, result, confidence, scan_time
                    FROM url_scans
                    WHERE user_id = ?
                    ORDER BY scan_time DESC
                    LIMIT ?
                """, (int(user_id), limit))
                
                rows = cursor.fetchall()
                return [
                    {
                        "url": row["url"],
                        "result": row["result"],
                        "confidence": row["confidence"],
                        "scan_time": row["scan_time"]
                    }
                    for row in rows
                ]
        except Exception as e:
            print(f"Error retrieving scan history: {e}")
            return []
    
    @staticmethod
    def get_total_scans() -> int:
        """Get total number of scans in the system."""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) as count FROM url_scans")
                row = cursor.fetchone()
                return row["count"] if row else 0
        except Exception as e:
            print(f"Error getting total scans: {e}")
            return 0
    
    @staticmethod
    def get_malicious_scans_count() -> int:
        """Get count of malicious URLs detected."""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT COUNT(*) as count 
                    FROM url_scans 
                    WHERE result = 'malicious' OR result = 'phishing'
                """)
                row = cursor.fetchone()
                return row["count"] if row else 0
        except Exception as e:
            print(f"Error getting malicious scans count: {e}")
            return 0
    
    @staticmethod
    def get_recent_malicious_scans(limit: int = 10) -> List[Dict]:
        """Get recent malicious scans from database."""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT url, result, confidence, scan_time
                    FROM url_scans 
                    WHERE result = 'malicious' OR result = 'phishing'
                    ORDER BY scan_time DESC 
                    LIMIT ?
                """, (limit,))
                
                rows = cursor.fetchall()
                recent_scans = []
                
                for row in rows:
                    # Determine threat type based on result
                    threat_type = "Phishing" if row["result"] == "phishing" else "Malware"
                    
                    recent_scans.append({
                        "url": row["url"],
                        "threat_type": threat_type,
                        "confidence": row["confidence"] or 0.5,
                        "detected_at": row["scan_time"]
                    })
                
                return recent_scans
                
        except Exception as e:
            print(f"Error getting recent malicious scans: {e}")
            return []

# Initialize database when module is imported
try:
    init_database()
except Exception as e:
    print(f"Failed to initialize database: {e}")
