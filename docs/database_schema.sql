-- =====================================================
-- Local Services Marketplace - Database Schema
-- Author: Mayank Saini
-- Database: PostgreSQL 16+
-- =====================================================

-- Drop tables if they exist (for clean re-runs during development)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- TABLE: users
-- Stores customers, service providers, and admins
-- =====================================================
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    role            VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'provider', 'admin')),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- TABLE: categories
-- Master list of service categories
-- =====================================================
CREATE TABLE categories (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(50) UNIQUE NOT NULL,
    description     TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: listings
-- Service listings created by providers
-- =====================================================
CREATE TABLE listings (
    id              SERIAL PRIMARY KEY,
    provider_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title           VARCHAR(150) NOT NULL,
    description     TEXT NOT NULL,
    price           DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    location        VARCHAR(150) NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_listings_provider ON listings(provider_id);
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_location ON listings(location);
CREATE INDEX idx_listings_active ON listings(is_active);

-- =====================================================
-- TABLE: bookings
-- Customer inquiries and bookings
-- =====================================================
CREATE TABLE bookings (
    id              SERIAL PRIMARY KEY,
    listing_id      INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    customer_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message         TEXT NOT NULL,
    preferred_date  DATE,
    status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_listing ON bookings(listing_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- =====================================================
-- SEED DATA: Default categories
-- =====================================================
INSERT INTO categories (name, description) VALUES
    ('Plumber', 'Plumbing repair and installation services'),
    ('Electrician', 'Electrical repair and installation services'),
    ('Tutor', 'Academic tutoring and coaching'),
    ('Cleaner', 'Home and office cleaning services'),
    ('Carpenter', 'Wood work and furniture repair'),
    ('Painter', 'Wall painting and decoration services'),
    ('AC Repair', 'Air conditioner repair and servicing'),
    ('Gardener', 'Gardening and landscaping services');

-- =====================================================
-- END OF SCHEMA
-- =====================================================