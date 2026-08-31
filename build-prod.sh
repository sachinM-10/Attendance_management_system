#!/usr/bin/env bash
set -e

echo "==================================================="
echo "Building Production Unified Executable Release JAR"
echo "==================================================="

echo ""
echo "[1/4] Building React Frontend..."
cd frontend
npm run build
cd ..

echo ""
echo "[2/4] Syncing frontend dist to backend static resources..."
mkdir -p backend/src/main/resources/static
cp -r frontend/dist/* backend/src/main/resources/static/

echo ""
echo "[3/4] Packaging Spring Boot Executable JAR..."
cd backend
./mvnw clean package -DskipTests
cd ..

echo ""
echo "==================================================="
echo "[SUCCESS] Production build complete!"
echo "Artifact: backend/target/management-1.0.0.jar"
echo ""
echo "To run locally:"
echo "java -jar backend/target/management-1.0.0.jar --spring.profiles.active=prod --server.port=5000"
echo "==================================================="
