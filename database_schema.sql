
-- Phase 1: Normalized Database Schema (3rd Normal Form)
-- Designed for SmartSure Project (Simon Kihiu & Brian Mbagara)

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'standard', -- admin, patient, hospital_admin, insurance_provider
    age INTEGER DEFAULT 30,
    dependents INTEGER DEFAULT 0,
    monthly_budget DECIMAL(10,2) DEFAULT 5000,
    priority VARCHAR(20) DEFAULT 'cost', -- cost, coverage, maternity
    beneficiaries JSONB DEFAULT '[]',
    hospital_id UUID REFERENCES hospitals(hospital_id),
    mfa_enabled BOOLEAN DEFAULT FALSE,
    consent_timestamp TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE insurance_providers (
    provider_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name VARCHAR(100) NOT NULL,
    tier VARCHAR(50), -- Public, Private, Premium
    headquarters_contact TEXT,
    logo_url TEXT,
    policy_doc_url TEXT -- URL to uploaded policy document
);

CREATE TABLE hospitals (
    hospital_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_name VARCHAR(200) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    hospital_level VARCHAR(50), -- Level 2-6
    contact_info TEXT,
    address TEXT,
    is_emergency_ready BOOLEAN DEFAULT TRUE,
    county VARCHAR(50) DEFAULT 'Kisii'
);

-- Many-to-Many: Accreditations mapping hospitals to insurance
CREATE TABLE accreditations (
    accreditation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES hospitals(hospital_id) ON DELETE CASCADE,
    provider_id UUID REFERENCES insurance_providers(provider_id) ON DELETE CASCADE,
    valid_until DATE,
    UNIQUE(hospital_id, provider_id)
);

CREATE TABLE user_wallets (
    wallet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    provider_id UUID REFERENCES insurance_providers(provider_id),
    membership_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    blockchain_hash TEXT, -- SHA-256 of current state
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE query_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    query_text TEXT,
    insurance_context VARCHAR(100),
    response_time_ms INTEGER,
    sentiment_score DECIMAL(3, 2), -- 0.00 to 1.00
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feedback (
    feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    hospital_id UUID REFERENCES hospitals(hospital_id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    ai_sentiment_flag VARCHAR(20), -- Positive, Neutral, Negative
    is_reviewed BOOLEAN DEFAULT FALSE
);
