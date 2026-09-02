-- =====================================================
-- Local Services Marketplace - Database Schema
-- Author: Mayank Saini
-- Database: PostgreSQL 16+
-- =====================================================

-- Drop tables if they exist (for clean re-runs during development).
-- Dependent tables are listed first for clarity; CASCADE also handles
-- any additional dependent objects.
DROP TABLE IF EXISTS user_reports, user_blocks, chat_messages, reviews, payments,
    notifications, favorites, chat_rooms, password_reset_tokens, coupons,
    bookings, listings, categories, users CASCADE;

-- =====================================================
-- TABLE: users
-- Stores customers, service providers, and admins
-- =====================================================
CREATE TABLE users (
    id                       SERIAL PRIMARY KEY,
    full_name                VARCHAR(100) NOT NULL,
    email                    VARCHAR(150) UNIQUE NOT NULL,
    password_hash            VARCHAR(255) NOT NULL,
    phone                    VARCHAR(20),
    role                     VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'provider', 'admin')),
    created_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    kyc_document_url         TEXT,
    kyc_status               VARCHAR(20) NOT NULL DEFAULT 'unverified',
    kyc_submitted_at         TIMESTAMP,
    avatar_url               TEXT,
    email_verified           BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token TEXT,
    phone_verified           BOOLEAN NOT NULL DEFAULT FALSE,
    background_checked       BOOLEAN NOT NULL DEFAULT FALSE,
    business_verified        BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- TABLE: categories
-- Master list of service categories
-- =====================================================
CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: listings
-- Service listings created by providers
-- =====================================================
CREATE TABLE listings (
    id          SERIAL PRIMARY KEY,
    provider_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title       VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    price       DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    location    VARCHAR(150) NOT NULL,
    image_urls  TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    id             SERIAL PRIMARY KEY,
    listing_id     INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    customer_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message        TEXT NOT NULL,
    preferred_date DATE,
    status         VARCHAR(20) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_listing ON bookings(listing_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- =====================================================
-- TABLE: password_reset_tokens
-- Hashed, single-use password reset tokens
-- =====================================================
CREATE TABLE password_reset_tokens (
    id         SERIAL PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_active ON password_reset_tokens(user_id, used, expires_at);

-- =====================================================
-- TABLE: reviews
-- One review per completed booking
-- =====================================================
CREATE TABLE reviews (
    id          SERIAL PRIMARY KEY,
    booking_id  INT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    listing_id  INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment            TEXT,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    moderation_status  VARCHAR(20) NOT NULL DEFAULT 'published'
                       CHECK (moderation_status IN ('published', 'hidden')),
    moderation_note    VARCHAR(500),
    moderated_at       TIMESTAMP,
    moderated_by_id    INT REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_reviews_listing ON reviews(listing_id);
CREATE INDEX idx_reviews_customer ON reviews(customer_id);
CREATE INDEX idx_reviews_provider ON reviews(provider_id);

-- =====================================================
-- TABLE: notifications
-- In-app notifications for authenticated users
-- =====================================================
CREATE TABLE notifications (
    id         SERIAL PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(50) NOT NULL,
    title      VARCHAR(200) NOT NULL,
    message    TEXT NOT NULL,
    link       VARCHAR(500),
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- =====================================================
-- TABLE: favorites
-- Saved listings for users
-- =====================================================
CREATE TABLE favorites (
    id         SERIAL PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_favorites_user_listing UNIQUE (user_id, listing_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_listing ON favorites(listing_id);

-- =====================================================
-- TABLE: chat_rooms
-- A conversation between one customer and one provider, optionally tied to a listing
-- =====================================================
CREATE TABLE chat_rooms (
    id              SERIAL PRIMARY KEY,
    customer_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id      INT REFERENCES listings(id) ON DELETE SET NULL,
    last_message    TEXT,
    last_message_at TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_chat_rooms_participants_listing UNIQUE (customer_id, provider_id, listing_id)
);

CREATE INDEX idx_chat_rooms_customer ON chat_rooms(customer_id);
CREATE INDEX idx_chat_rooms_provider ON chat_rooms(provider_id);
CREATE INDEX idx_chat_rooms_listing ON chat_rooms(listing_id);

-- =====================================================
-- TABLE: chat_messages
-- Messages sent in chat rooms
-- =====================================================
CREATE TABLE chat_messages (
    id         SERIAL PRIMARY KEY,
    room_id    INT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_room_created ON chat_messages(room_id, created_at);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);

-- =====================================================
-- TABLE: coupons
-- Discount codes used at booking time
-- =====================================================
CREATE TABLE coupons (
    id                  SERIAL PRIMARY KEY,
    code                VARCHAR(50) UNIQUE NOT NULL,
    discount_type       VARCHAR(20) NOT NULL CHECK (discount_type IN ('flat', 'percent')),
    discount_value      DECIMAL(10, 2) NOT NULL CHECK (discount_value >= 0),
    min_booking_amount  DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (min_booking_amount >= 0),
    max_discount_amount DECIMAL(10, 2) CHECK (max_discount_amount IS NULL OR max_discount_amount >= 0),
    is_active            BOOLEAN NOT NULL DEFAULT TRUE,
    expiry_date         TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coupons_active_expiry ON coupons(is_active, expiry_date);

-- =====================================================
-- TABLE: payments
-- Razorpay payment orders and verification records
-- =====================================================
CREATE TABLE payments (
    id                    SERIAL PRIMARY KEY,
    booking_id            INT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    razorpay_order_id     VARCHAR(100) NOT NULL UNIQUE,
    razorpay_payment_id   VARCHAR(100),
    razorpay_signature    VARCHAR(255),
    amount                DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    currency              VARCHAR(10) NOT NULL DEFAULT 'INR',
    status                VARCHAR(20) NOT NULL DEFAULT 'created',
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_status ON payments(status);

-- =====================================================
-- TABLE: user_blocks
-- A user can prevent another user from starting new conversations/bookings.
-- =====================================================
CREATE TABLE user_blocks (
    id              SERIAL PRIMARY KEY,
    blocker_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_blocks_pair UNIQUE (blocker_id, blocked_user_id),
    CONSTRAINT ck_user_blocks_not_self CHECK (blocker_id <> blocked_user_id)
);

CREATE INDEX idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked ON user_blocks(blocked_user_id);

-- =====================================================
-- TABLE: user_reports
-- Safety and trust reports submitted by authenticated users.
-- =====================================================
CREATE TABLE user_reports (
    id               SERIAL PRIMARY KEY,
    reporter_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id       INT REFERENCES listings(id) ON DELETE SET NULL,
    category         VARCHAR(50) NOT NULL,
    description      VARCHAR(2000) NOT NULL,
    status           VARCHAR(30) NOT NULL DEFAULT 'open'
                     CHECK (status IN ('open', 'under_review', 'resolved', 'rejected')),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at      TIMESTAMP,
    resolved_by_id   INT REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_user_reports_not_self CHECK (reporter_id <> reported_user_id)
);

CREATE INDEX idx_user_reports_status_created ON user_reports(status, created_at DESC);
CREATE INDEX idx_user_reports_reporter ON user_reports(reporter_id);
CREATE INDEX idx_user_reports_reported_user ON user_reports(reported_user_id);

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
