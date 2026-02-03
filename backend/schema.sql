-- Create Database (Manual step in some environments, but provided for reference)
-- CREATE DATABASE lifeline_db;

-- Connect to lifeline_db
-- \c lifeline_db;

CREATE TYPE gender_type AS ENUM ('Male', 'Female');
CREATE TYPE match_preference_type AS ENUM ('my-church', 'my-church-plus', 'other-churches');
CREATE TYPE subscription_tier_type AS ENUM ('free', 'premium');
CREATE TYPE subscription_status_type AS ENUM ('active', 'expired', 'canceled');

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(191) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    gender gender_type NOT NULL,
    
    -- Origin Info
    originCountry VARCHAR(100),
    originState VARCHAR(100),
    originLga VARCHAR(100),
    
    -- Residence Info
    residenceCountry VARCHAR(100),
    residenceState VARCHAR(100),
    residenceCity VARCHAR(100),
    residenceAddress TEXT,
    
    -- Profile Info
    occupation VARCHAR(200),
    interests JSONB,
    church VARCHAR(200),
    matchPreference match_preference_type,
    
    -- Subscription Info
    subscription_tier subscription_tier_type DEFAULT 'free',
    subscription_status subscription_status_type DEFAULT 'active',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    
    isVerified BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Function to update updatedAt column
CREATE OR REPLACE FUNCTION update_updatedAt_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function
CREATE TRIGGER update_users_updatedAt
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE update_updatedAt_column();
