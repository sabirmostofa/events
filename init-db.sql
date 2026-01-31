-- Create databases for each microservice
CREATE DATABASE auth_db;
CREATE DATABASE event_db;
CREATE DATABASE reg_db;
CREATE DATABASE payment_db;
CREATE DATABASE artist_db;
CREATE DATABASE accounting_db;

--- Create Tables

\c event_db;

CREATE TABLE events (
    -- Native Postgres 18 UUIDv7
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    price_euro DECIMAL(10, 2) NOT NULL,
    organizer_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- Connect to reg_db and create its tables
\c reg_db;

-- Create a custom type for Registration Status
DO $$ BEGIN
    CREATE TYPE reg_status AS ENUM ('pending', 'confirmed', 'cancelled', 'waitlist');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table to sync events from the Event Service (via Kafka)
CREATE TABLE IF NOT EXISTS available_events (
    id UUID PRIMARY KEY, -- Matches the ID from Event Service
    title TEXT NOT NULL,
    price_euro DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table for the actual participants
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    event_id UUID NOT NULL REFERENCES available_events(id) ON DELETE CASCADE,
    participant_name TEXT NOT NULL,
    participant_email TEXT NOT NULL,
    role TEXT CHECK (role IN ('leader', 'follower', 'both')),
    status reg_status DEFAULT 'pending',
    payment_id TEXT, -- To be filled by the Payment Service later
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on event_id for faster lookups when checking festival capacity
CREATE INDEX IF NOT EXISTS idx_reg_event_id ON registrations(event_id);


\c payment_db;

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    registration_id UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    stripe_session_id TEXT,
    status TEXT DEFAULT 'pending', -- pending, authorized, captured, failed
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Grant privileges if you use specific users
-- GRANT ALL PRIVILEGES ON DATABASE auth_db TO "user";


