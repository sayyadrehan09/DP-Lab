@echo off
title CinePattern - Movie & OTT Recommendation System
echo ===================================================================
echo             MOVIE ^& OTT RECOMMENDATION SYSTEM
echo        8 Gang of Four Design Patterns Lab Assessment
echo ===================================================================

:: Check for javac in PATH, or fallback to IntelliJ OpenJDK or JAVA_HOME
set JAVAC_CMD=javac
set JAVA_CMD=java

where javac >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    if exist "%USERPROFILE%\.jdks\openjdk-24\bin\javac.exe" (
        set "JAVAC_CMD=%USERPROFILE%\.jdks\openjdk-24\bin\javac.exe"
        set "JAVA_CMD=%USERPROFILE%\.jdks\openjdk-24\bin\java.exe"
    ) else if defined JAVA_HOME (
        if exist "%JAVA_HOME%\bin\javac.exe" (
            set "JAVAC_CMD=%JAVA_HOME%\bin\javac.exe"
            set "JAVA_CMD=%JAVA_HOME%\bin\java.exe"
        )
    )
)

echo [1/3] Navigating to backend directory...
cd /d "%~dp0backend"

echo [2/3] Compiling Java backend sources into bin directory...
if not exist bin mkdir bin
"%JAVAC_CMD%" -d bin *.java
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed. Please fix Java errors.
    pause
    exit /b %ERRORLEVEL%
)

echo [3/3] Launching Java REST Server and opening interface...
start "CinePattern Backend Server" cmd /k "cd /d "%~dp0backend" && "%JAVA_CMD%" -cp bin Server"

timeout /t 2 >nul
start http://localhost:8080

echo ===================================================================
echo [SUCCESS] Backend server launched!
echo Web Interface opened at: http://localhost:8080
echo CLI Runner is also available at: backend/Main.java
echo ===================================================================
pause
