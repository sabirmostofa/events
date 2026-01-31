#!/bin/bash

# API Endpoint
API_URL="http://localhost:8080/events"

# Function to send a POST request
create_event() {
  curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$1" | jq . # jq makes the output pretty
}

echo "🚀 Starting to seed Tango Events..."

# Event 1: Berlin Marathon
create_event '{
  "title": "Berlin Tango High Marathon",
  "description": "A high-energy marathon in a glass-roofed venue.",
  "location": "Berlin, Germany",
  "start_date": "2026-05-15T20:00:00Z",
  "end_date": "2026-05-18T04:00:00Z",
  "price_euro": 120.00,
  "organizer_id": "018d45f3-7b12-7abc-8def-0123456789ab"
}'

# Event 2: Paris Festival
create_event '{
  "title": "Paris Abrazos Festival",
  "description": "Elegant workshops and evening milongas.",
  "location": "Paris, France",
  "start_date": "2026-09-10T14:00:00Z",
  "end_date": "2026-09-14T02:00:00Z",
  "price_euro": 250.00,
  "organizer_id": "018d45f3-7b12-7abc-8def-0123456789ac"
}'

# Event 3: Dhaka Milonga Weekend
create_event '{
  "title": "Dhaka Moonlight Milonga",
  "description": "An intimate gathering celebrating tango in South Asia.",
  "location": "Dhaka, Bangladesh",
  "start_date": "2026-11-20T18:00:00Z",
  "end_date": "2026-11-22T23:00:00Z",
  "price_euro": 45.00,
  "organizer_id": "018d45f3-7b12-7abc-8def-0123456789ad"
}'

# Event 4: Hamburg Marathon
create_event '{
  "title": "Elbe Port Marathon",
  "description": "Traditional milonguero marathon by the river.",
  "location": "Hamburg, Germany",
  "start_date": "2026-06-05T21:00:00Z",
  "end_date": "2026-06-08T05:00:00Z",
  "price_euro": 110.00,
  "organizer_id": "018d45f3-7b12-7abc-8def-0123456789ae"
}'

echo "✅ Seeding complete!"