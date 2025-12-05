@echo off
echo ðŸ”ï¸  Starting Kashmir Tourism Platform...
echo.

REM Start MongoDB (assuming it's installed and in PATH)
echo ðŸ“Š Starting MongoDB...
net start MongoDB 2>nul
if %errorlevel% neq 0 (
    echo MongoDB service not found or failed to start. Make sure MongoDB is installed and running.
)

REM Start Python ML API
echo ðŸ¤– Starting Python ML Service...
cd backend
start "ML Service" /D "%cd%" py app.py
cd ..

REM Wait for ML service to start
timeout /t 5 /nobreak >nul

REM Start Node.js API
echo âš™ï¸  Starting Node.js API...
cd server
start "Node API" /D "%cd%" npm start
cd ..

REM Wait for Node API to start
timeout /t 5 /nobreak >nul

REM Start React Frontend
echo âš›ï¸  Starting React Frontend...
cd client
start "React Frontend" /D "%cd%" npm start
cd ..

echo âœ… All services started!
echo.
echo ðŸ“ URLs:
echo    Frontend: http://localhost:3000
echo    Node API: http://localhost:3001
echo    ML API:   http://localhost:5000
echo.
echo Press any key to close this window...
pause >nul