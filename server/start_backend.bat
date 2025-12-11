@echo off
echo Killing any existing process on port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    if not "%%a"=="0" (
        echo Killing process %%a
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo Waiting for port to be released...
timeout /t 3 /nobreak >nul

echo Starting Backend Server...
cd /d "%~dp0"
node server.js