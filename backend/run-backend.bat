@echo off
echo =====================================================
echo  Compiling and Launching Java Backend REST Server...
echo =====================================================
cd /d "%~dp0"

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

if not exist bin mkdir bin
"%JAVAC_CMD%" -d bin *.java
if %ERRORLEVEL% NEQ 0 (
    echo Compilation failed! Please check Java errors above.
    pause
    exit /b %ERRORLEVEL%
)
echo Starting Server on port 8080...
"%JAVA_CMD%" -cp bin Server
pause
