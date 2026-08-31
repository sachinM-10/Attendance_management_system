@echo off
echo ===================================================
echo Building Production Unified Executable Release JAR
echo ===================================================

echo.
echo [1/4] Building React Frontend...
cd frontend
cmd /c npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend build failed!
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo [2/4] Syncing frontend dist to backend static resources...
if not exist "backend\src\main\resources\static" mkdir "backend\src\main\resources\static"
xcopy /E /Y /Q "frontend\dist\*" "backend\src\main\resources\static\"

echo.
echo [3/4] Packaging Spring Boot Executable JAR...
cd backend
call .\mvnw.cmd clean package -DskipTests
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend packaging failed!
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo ===================================================
echo [SUCCESS] Production build complete!
echo Artifact: backend\target\management-1.0.0.jar
echo.
echo To run locally:
echo java -jar backend\target\management-1.0.0.jar --spring.profiles.active=prod --server.port=5000
echo ===================================================
