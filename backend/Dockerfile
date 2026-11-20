
# Stage 1: Build Spring Boot application
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

# Copy Gradle wrapper and build configuration
COPY gradlew .
COPY gradle ./gradle
COPY build.gradle .
COPY settings.gradle .

# Make Gradle wrapper executable
RUN chmod +x gradlew

# Copy source code
COPY src ./src

# Build Spring Boot executable JAR
RUN ./gradlew bootJar --no-daemon

# Stage 2: Run application
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy Spring Boot JAR
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
