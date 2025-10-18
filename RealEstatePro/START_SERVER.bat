@echo off
color 0A
title BlueCrumbs Real Estate Server
echo ========================================
echo   BlueCrumbs Real Estate - Server
echo ========================================
echo.

cd server

echo [Step 1/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing Node.js packages...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo Done!
) else (
    echo Dependencies already installed!
)
echo.

echo [Step 2/3] Verifying database...
echo Checking if database tables exist...
node setup-database.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Database setup failed!
    echo Please check:
    echo - MySQL is running
    echo - Credentials in .env are correct
    echo.
    pause
    exit /b 1
)
echo.

echo [Step 3/3] Starting server...
echo.
echo ========================================
echo   SERVER STARTED SUCCESSFULLY!
echo ========================================
echo.
echo Public Website:
echo   http://localhost:3000/
echo.
echo Test Form:
echo   http://localhost:3000/TEST_FORM.html
echo.
echo Admin Panel:
echo   http://localhost:3000/admin/login.html
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

node server.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Server failed to start!
    pause
)
pause
