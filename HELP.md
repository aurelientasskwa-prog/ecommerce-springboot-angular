Project quick help

Run the application locally using the in-memory H2 database (dev profile).

On Windows (cmd.exe) from the project root:

1) Build (skip tests to speed up):

   mvn -DskipTests package

2) Run with the "dev" Spring profile which uses H2 (no Postgres credentials needed):

   mvn -DskipTests spring-boot:run -Dspring-boot.run.profiles=dev

3) Run the integration smoke test (uses the dev profile):

   mvn -Dtest=IntegrationSmokeTest -Dspring.profiles.active=dev test

Run with a local Postgres using docker-compose

1) Start Postgres (from project root). This reads credentials from `.env.postgres`:

   docker-compose up -d

2) Wait a few seconds for the DB to initialize. Then run the app using the default profile (which expects Postgres):

   mvn -DskipTests spring-boot:run

3) When finished, stop and remove the containers:

   docker-compose down

Notes:
- The default profile expects a PostgreSQL database configured via application.properties; if you do not have Postgres or valid credentials the app will fail to start. Use the "dev" profile above for local development.
- To run against Postgres without docker-compose, configure the datasource settings in application.properties or set environment variables (SPRING_DATASOURCE_URL, SPRING_DATASOURCE_USERNAME, SPRING_DATASOURCE_PASSWORD) before starting the app.
- The included `.env.postgres` file contains example credentials (POSTGRES_USER=postgres, POSTGRES_PASSWORD=postgres, POSTGRES_DB=demo). Change them if you prefer.
