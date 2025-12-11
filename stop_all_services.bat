@echo off
echo ========================================
echo Stopping Kashmir Tourism Fullstack App
echo ========================================

echo.
echo 1. Stopping Frontend (port 3014)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3014') do (
    if not "%%a"=="0" (
        echo Killing process %%a
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo 2. Stopping Backend Server (port 3001)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    if not "%%a"=="0" (
        echo Killing process %%a
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo 3. Stopping ML API Server (port 8002)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8002') do (
    if not "%%a"=="0" (
        echo Killing process %%a
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo All services stopped!
echo.
echo Press any key to exit...
pause >nul