@echo off
echo ==================================================
echo THERMOSENTRY SIH 2026 DEMO STARTUP SCRIPT
echo ==================================================
echo.

echo [1/3] Checking environment...
if not exist "backend\.venv\Scripts\python.exe" (
    echo [ERROR] Python virtual environment not found in backend\.venv
    echo Please follow the README to set up the environment.
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo [ERROR] node_modules not found in frontend\
    echo Please follow the README to run npm install.
    pause
    exit /b 1
)

echo [2/3] Starting FastAPI Backend on Port 8000...
start "THERMOSENTRY Backend" cmd /c "cd backend && .venv\Scripts\activate && uvicorn main:app --port 8000"

echo [3/3] Starting Vite Frontend on Port 5173...
start "THERMOSENTRY Frontend" cmd /c "cd frontend && npm run dev"

echo.
echo ==================================================
echo THERMOSENTRY IS RUNNING!
echo ==================================================
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
echo Please open http://localhost:5173 in your web browser.
echo Close the two new terminal windows to stop the servers.
pause
