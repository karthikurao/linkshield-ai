@echo off
REM SQLite Database Explorer Batch Script for Windows
REM This script provides interactive SQLite commands

set DB_PATH=backend\app\linkshield.db

echo LinkShield AI Database Explorer (SQLite CLI)
echo ==============================================
echo.
echo Available commands you can run:
echo.
echo 1. View all tables:
echo    .tables
echo.
echo 2. View table structure:
echo    .schema users
echo    .schema url_scans  
echo    .schema user_profiles
echo.
echo 3. View all users:
echo    SELECT * FROM users;
echo.
echo 4. View URL scan history:
echo    SELECT * FROM url_scans;
echo.
echo 5. View user profiles:
echo    SELECT * FROM user_profiles;
echo.
echo 6. Complex queries (examples):
echo    SELECT u.name, u.email, COUNT(s.id) as scan_count 
echo    FROM users u LEFT JOIN url_scans s ON u.id = s.user_id 
echo    GROUP BY u.id;
echo.
echo 7. Exit SQLite:
echo    .quit
echo.
echo Starting SQLite CLI...
echo.

sqlite3 %DB_PATH%
