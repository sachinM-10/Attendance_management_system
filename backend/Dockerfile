# Multi-stage Dockerfile for Spring Boot Backend

# Stage 1: Build Application JAR
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy Maven POM and wrapper
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Download dependencies (caching layer)
RUN ./mvnw dependency:go-offline -B

# Copy source code and build production artifact
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Production Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Add non-root application user for container security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy built JAR artifact from builder stage
COPY --from=builder /app/target/management-*.jar app.jar

# Expose default application port
EXPOSE 8080

# Environment defaults
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-jar", "app.jar"]
