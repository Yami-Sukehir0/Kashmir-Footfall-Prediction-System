@echo off
echo Starting Kashmir Tourism Footfall Prediction Platform...
echo.

echo Starting ML Service ^(Python^)...
start "ML Service" /D "C:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend" py app.py
timeout /t 5 /nobreak >nul

echo Starting Backend Service ^(Node.js^)...
start "Backend Service" /D "C:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\server" node server.js
timeout /t 5 /nobreak >nul

echo Starting Frontend Service ^(React^)...
start "Frontend Service" /D "C:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\client" npm start

echo.
echo All services started!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3001
echo ML Service: http://localhost:5000
pause