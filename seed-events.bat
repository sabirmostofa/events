@echo off
SET API_URL=http://localhost:8080/events

echo 🚀 Starting to seed Tango Events on Windows...

:: Event 1: Berlin Marathon
curl -X POST %API_URL% ^
-H "Content-Type: application/json" ^
-d "{\"title\": \"Berlin Tango High Marathon\", \"description\": \"A high-energy marathon in a glass-roofed venue.\", \"location\": \"Berlin, Germany\", \"start_date\": \"2026-05-15T20:00:00Z\", \"end_date\": \"2026-05-18T04:00:00Z\", \"price_euro\": 120.00, \"organizer_id\": \"018d45f3-7b12-7abc-8def-0123456789ab\"}"

echo.
echo --------------------------------------------------

:: Event 2: Paris Festival
curl -X POST %API_URL% ^
-H "Content-Type: application/json" ^
-d "{\"title\": \"Paris Abrazos Festival\", \"description\": \"Elegant workshops and evening milongas.\", \"location\": \"Paris, France\", \"start_date\": \"2026-09-10T14:00:00Z\", \"end_date\": \"2026-09-14T02:00:00Z\", \"price_euro\": 250.00, \"organizer_id\": \"018d45f3-7b12-7abc-8def-0123456789ac\"}"

echo.
echo --------------------------------------------------

:: Event 3: Dhaka Milonga
curl -X POST %API_URL% ^
-H "Content-Type: application/json" ^
-d "{\"title\": \"Dhaka Moonlight Milonga\", \"description\": \"An intimate gathering in South Asia.\", \"location\": \"Dhaka, Bangladesh\", \"start_date\": \"2026-11-20T18:00:00Z\", \"end_date\": \"2026-11-22T23:00:00Z\", \"price_euro\": 45.00, \"organizer_id\": \"018d45f3-7b12-7abc-8def-0123456789ad\"}"

echo.
echo.
echo ✅ Seeding complete!
pause