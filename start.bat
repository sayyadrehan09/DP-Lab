@echo off
title CinePattern - Movie & OTT Recommendation System
echo ===================================================================
echo             MOVIE ^& OTT RECOMMENDATION SYSTEM
echo        5 Gang of Four Design Patterns Lab Assessment
echo ===================================================================
echo [1/3] Navigating to backend directory...
cd /d "%~dp0backend"

echo [2/3] Compiling Java backend sources...
javac -d . *.java
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed. Please fix Java errors.
    pause
    exit /b %ERRORLEVEL%
)

echo [3/3] Launching Java REST Server and opening interface...
start "CinePattern Backend Server" cmd /k "cd /d "%~dp0backend" && java Server"

timeout /t 2 >nul
start http://localhost:8080

echo ===================================================================
echo [SUCCESS] Backend server launched!
echo Web Interface opened at: http://localhost:8080
echo CLI Runner is also available at: backend/Main.java
echo ===================================================================
pause
