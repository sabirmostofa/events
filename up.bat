@echo off
echo --------------------------------------------------
echo 🚀 STARTING TANGO EVENT PLATFORM 🚀
echo --------------------------------------------------

:: Stop any old containers and clean up volumes if needed
echo 🛑 Stopping existing services...
docker-compose down

:: Build and start the services
echo 🛠️  Building and starting containers...
docker-compose up --build -d

echo --------------------------------------------------
echo ✅ Services are starting in the background!
echo.
echo Event Service:        http://localhost:8080
echo Registration Service: http://localhost:8081
echo --------------------------------------------------
echo ⏳ Waiting for Kafka and Postgres to be ready...
timeout /t 15

echo 🔍 Current Container Status:
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo 💡 TIP: Run 'seed-events.bat' now to populate data.
echo --------------------------------------------------
pause