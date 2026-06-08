# Runtime-only image. Build the jar on your PC first:
#   cd backend && .\mvnw.cmd -DskipTests package
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
