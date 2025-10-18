@echo off
color 0A
echo ========================================
echo   BlueCrumbs - Complete Setup & Test
echo ========================================
echo.

cd server

echo [1/5] Installing Node.js dependencies...
if not exist "node_modules" (
    call npm install
    echo     Done!
) else (
    echo     Already installed!
)
echo.

echo [2/5] Setting up database...
node setup-database.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Database setup failed!
    echo Please check:
    echo - MySQL is running
    echo - Credentials in .env are correct
    pause
    exit /b 1
)
echo.

echo [3/5] Testing database connection...
node test-db.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Database test failed!
    pause
    exit /b 1
)
echo.

echo [4/5] Checking for admin user...
echo If no admin exists, you'll be prompted to create one.
echo.
pause

echo [5/5] Starting server...
echo.
echo ========================================
echo   Server will start on:
echo   http://localhost:3000
echo.
echo   Admin Panel:
echo   http://localhost:3000/admin/login.html
echo.
echo   Press Ctrl+C to stop
echo ========================================
echo.

node server.js

pause
