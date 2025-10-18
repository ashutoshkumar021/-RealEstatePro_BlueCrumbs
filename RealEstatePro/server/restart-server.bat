@echo off
echo Stopping existing Node.js processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a 2>nul
)
timeout /t 2 /nobreak >nul
echo Starting server...
start cmd /k "node server.js"
echo.
echo Server is starting on http://localhost:3000
echo Admin panel: http://localhost:3000/admin/login.html
echo.
pause
