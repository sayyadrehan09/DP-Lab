@echo off
echo =====================================================
echo  Compiling and Launching Java Backend REST Server...
echo =====================================================
cd /d "%~dp0"
javac -d . *.java
if %ERRORLEVEL% NEQ 0 (
    echo Compilation failed! Please check Java errors above.
    pause
    exit /b %ERRORLEVEL%
)
echo Starting Server on port 8080...
java Server
pause
