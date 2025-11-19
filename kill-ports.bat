@echo off
echo Cleaning up ports 5000 and 3050...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    echo Killing process on port 5000 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3050 ^| findstr LISTENING') do (
    echo Killing process on port 3050 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

echo Ports cleaned! You can now run: npm run dev
timeout /t 2 >nul
