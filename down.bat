@echo off
echo --------------------------------------------------
echo 🛑 SHUTTING DOWN TANGO EVENT PLATFORM 🛑
echo --------------------------------------------------

:: Stop and remove containers
echo ⏳ Stopping containers...
docker-compose stop

:: Ask if the user wants to remove volumes (delete database data)
set /p cleanup="Do you want to delete all database and Kafka data? (y/n): "

if /I "%cleanup%"=="y" (
    echo 🧹 Cleaning up containers, networks, and VOLUMES...
    docker-compose down -v
    echo ✨ System is clean. Databases have been reset.
) else (
    echo 🚪 Containers stopped. Data is preserved in volumes.
    docker-compose down
)

echo --------------------------------------------------
echo ✅ Shutdown complete.
echo --------------------------------------------------
pause