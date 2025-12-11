@echo off
echo ========================================
echo Starting Kashmir Tourism Fullstack App
echo ========================================

echo.
echo 1. Starting ML API Server (port 8002)...
cd /d "%~dp0\backend"
start "ML API Server" /min cmd /c python start_server.py

echo.
echo 2. Starting Backend Server (port 3001)...
timeout /t 5 /nobreak >nul
cd /d "%~dp0\server"
start "Backend Server" /min cmd /c node server.js

echo.
echo 3. Starting Frontend (port 3014)...
timeout /t 5 /nobreak >nul
cd /d "%~dp0\client"
start "Frontend" /min cmd /c npm start

echo.
echo All services started!
echo.
echo ML API:     http://localhost:8002
echo Backend:    http://localhost:3001
echo Frontend:   http://localhost:3014
echo.
echo Press any key to exit...
pause >nul