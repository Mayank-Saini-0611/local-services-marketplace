-- =====================================================
-- Local Services Marketplace - Test Data Seeder (FIXED)
-- =====================================================

-- Clean existing test data first (preserves your real users)
DELETE FROM listings WHERE provider_id IN (
    SELECT id FROM users WHERE email IN (
        'rajesh.kumar@plumber.com',
        'amit.sharma@electrician.com',
        'priya.singh@tutor.com',
        'sunil.verma@cleaner.com',
        'ravi.patel@carpenter.com'
    )
);

DELETE FROM users WHERE email IN (
    'rajesh.kumar@plumber.com',
    'amit.sharma@electrician.com',
    'priya.singh@tutor.com',
    'sunil.verma@cleaner.com',
    'ravi.patel@carpenter.com'
);

-- =====================================================
-- INSERT 5 PROVIDERS (password for all: "provider123")
-- =====================================================
INSERT INTO users (full_name, email, password_hash, phone, role, created_at, updated_at) VALUES
('Rajesh Kumar', 'rajesh.kumar@plumber.com', '$2a$11$rZxNqLZGyZ8FmJjmU7vKgu7K3yYg8RXjz8VbZxN5dJv6KqLm4Y2QC', '9876543210', 'provider', NOW(), NOW()),
('Amit Sharma', 'amit.sharma@electrician.com', '$2a$11$rZxNqLZGyZ8FmJjmU7vKgu7K3yYg8RXjz8VbZxN5dJv6KqLm4Y2QC', '9876543211', 'provider', NOW(), NOW()),
('Priya Singh', 'priya.singh@tutor.com', '$2a$11$rZxNqLZGyZ8FmJjmU7vKgu7K3yYg8RXjz8VbZxN5dJv6KqLm4Y2QC', '9876543212', 'provider', NOW(), NOW()),
('Sunil Verma', 'sunil.verma@cleaner.com', '$2a$11$rZxNqLZGyZ8FmJjmU7vKgu7K3yYg8RXjz8VbZxN5dJv6KqLm4Y2QC', '9876543213', 'provider', NOW(), NOW()),
('Ravi Patel', 'ravi.patel@carpenter.com', '$2a$11$rZxNqLZGyZ8FmJjmU7vKgu7K3yYg8RXjz8VbZxN5dJv6KqLm4Y2QC', '9876543214', 'provider', NOW(), NOW());

-- =====================================================
-- INSERT 30 LISTINGS using subqueries to get provider IDs
-- =====================================================

-- PLUMBING (category_id = 1) - 4 listings
INSERT INTO listings (provider_id, category_id, title, description, price, location, is_active, created_at, updated_at) VALUES
((SELECT id FROM users WHERE email = 'rajesh.kumar@plumber.com'), 1, 'Expert Plumbing Service - 10 Years Experience', 'Professional plumber with 10+ years of experience in residential and commercial plumbing. Specializes in leak repair, pipe installation, bathroom fittings, water heater installation, and emergency services. Available 24/7 for urgent issues. All work comes with 6-month warranty.', 500.00, 'Delhi NCR', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'rajesh.kumar@plumber.com'), 1, 'Emergency 24/7 Plumbing Services', 'Round-the-clock emergency plumbing services. Quick response within 30 minutes. Specializes in burst pipes, blocked drains, toilet repairs, and water leakage. Licensed and insured. Free quotation provided.', 800.00, 'Mumbai', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'rajesh.kumar@plumber.com'), 1, 'Bathroom Renovation & Plumbing', 'Complete bathroom renovation services including plumbing, tiling consultation, and fixture installation. Modern designs with quality materials. Get your dream bathroom in 5-7 days.', 15000.00, 'Bangalore', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'rajesh.kumar@plumber.com'), 1, 'Geyser Installation & Repair', 'Expert geyser installation, repair, and maintenance services. Works with all major brands - Bajaj, Crompton, V-Guard, Havells, Racold. Same-day service available.', 450.00, 'Pune', TRUE, NOW(), NOW());

-- ELECTRICIAN (category_id = 2) - 4 listings
INSERT INTO listings (provider_id, category_id, title, description, price, location, is_active, created_at, updated_at) VALUES
((SELECT id FROM users WHERE email = 'amit.sharma@electrician.com'), 2, 'Certified Electrician - All Electrical Work', 'Licensed electrician with 12 years of experience. Services include wiring, switch installation, fan/light fitting, MCB installation, electrical inspection, and emergency repairs. Free site visit and quotation.', 400.00, 'Delhi NCR', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'amit.sharma@electrician.com'), 2, 'House Wiring & Rewiring Specialist', 'Complete house wiring and rewiring services for new constructions and old houses. Uses ISI marked materials. Safety-first approach with proper earthing. 1-year service warranty.', 25000.00, 'Mumbai', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'amit.sharma@electrician.com'), 2, 'Fan & Light Installation Services', 'Quick installation of ceiling fans, exhaust fans, LED lights, chandeliers, and decorative lights. Professional installation with safety checks. Available all over Hyderabad.', 350.00, 'Hyderabad', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'amit.sharma@electrician.com'), 2, 'Inverter & UPS Installation', 'Expert in inverter, UPS, and battery installation/replacement. Works with Luminous, Microtek, Exide, and Amaron brands. Maintenance contracts available.', 1200.00, 'Chennai', TRUE, NOW(), NOW());

-- TUTORING (category_id = 3) - 5 listings
INSERT INTO listings (provider_id, category_id, title, description, price, location, is_active, created_at, updated_at) VALUES
((SELECT id FROM users WHERE email = 'priya.singh@tutor.com'), 3, 'Mathematics Tutor - Class 6 to 12', 'M.Sc. Mathematics with 8 years of teaching experience. Specializes in CBSE, ICSE, and State Board curriculum. Focuses on concept clarity and exam preparation. Online and home tuition available.', 600.00, 'Delhi NCR', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'priya.singh@tutor.com'), 3, 'Physics Tutor for JEE/NEET Preparation', 'IIT graduate offering Physics coaching for JEE Main, JEE Advanced, and NEET. 7 years of teaching experience with proven track record. Small batch sizes for personalized attention.', 1000.00, 'Mumbai', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'priya.singh@tutor.com'), 3, 'English Speaking Classes', 'Improve your English speaking and communication skills. 3-month intensive course covering grammar, vocabulary, pronunciation, and confidence building. Suitable for students and working professionals.', 2500.00, 'Bangalore', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'priya.singh@tutor.com'), 3, 'Computer Science Tutor - Programming', 'Learn Python, Java, C++, Web Development from scratch. Personalized curriculum based on your goals. Project-based learning approach. Suitable for students and career switchers.', 800.00, 'Pune', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'priya.singh@tutor.com'), 3, 'Hindi & Sanskrit Tutor', 'Native Hindi speaker offering classes for school students. Covers grammar, literature, and writing skills. Sanskrit classes also available. Affordable rates for groups.', 400.00, 'Jaipur', TRUE, NOW(), NOW());

-- CLEANING (category_id = 4) - 4 listings
INSERT INTO listings (provider_id, category_id, title, description, price, location, is_active, created_at, updated_at) VALUES
((SELECT id FROM users WHERE email = 'sunil.verma@cleaner.com'), 4, 'Deep Home Cleaning Service', 'Professional deep cleaning service for 1BHK, 2BHK, 3BHK homes. Includes kitchen, bathroom, balcony, and all rooms. Uses eco-friendly cleaning products. Trained and verified staff. 100% satisfaction guarantee.', 2000.00, 'Delhi NCR', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'sunil.verma@cleaner.com'), 4, 'Office & Commercial Cleaning', 'Daily, weekly, and monthly office cleaning services. Includes dusting, mopping, sanitization, washroom cleaning. Trained staff with proper equipment. Customized packages available.', 5000.00, 'Mumbai', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'sunil.verma@cleaner.com'), 4, 'Sofa & Carpet Cleaning', 'Professional sofa, carpet, and upholstery cleaning using steam cleaning method. Removes stains, odors, and allergens. Safe for kids and pets. Same-day service available.', 1500.00, 'Bangalore', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'sunil.verma@cleaner.com'), 4, 'Kitchen & Bathroom Deep Cleaning', 'Specialized deep cleaning for kitchen (chimney, exhaust, tiles, sinks) and bathroom (tiles, grouting, fittings, drainage). Removes hard water stains and grease.', 1800.00, 'Hyderabad', TRUE, NOW(), NOW());

-- CARPENTRY (category_id = 5) - 4 listings
INSERT INTO listings (provider_id, category_id, title, description, price, location, is_active, created_at, updated_at) VALUES
((SELECT id FROM users WHERE email = 'ravi.patel@carpenter.com'), 5, 'Custom Furniture Maker', 'Skilled carpenter specializing in custom furniture - wardrobes, beds, dining tables, study tables, TV units. Uses high-quality plywood and finishes. 5-year structural warranty.', 8000.00, 'Delhi NCR', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'ravi.patel@carpenter.com'), 5, 'Modular Kitchen Installation', 'Complete modular kitchen design and installation. Multiple finish options - laminate, acrylic, PU. Hettich and Ebco fittings. 3D design service included.', 45000.00, 'Mumbai', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'ravi.patel@carpenter.com'), 5, 'Furniture Repair & Polishing', 'Repair of broken furniture, hinge replacement, drawer fixing, polishing of old wooden items. Quick service with quality finish. Affordable rates.', 600.00, 'Bangalore', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'ravi.patel@carpenter.com'), 5, 'Door & Window Installation', 'Installation and repair of wooden doors, windows, and frames. Includes hardware fitting. Termite-treated wood used.', 2500.00, 'Pune', TRUE, NOW(), NOW());

-- PAINTING (category_id = 6) - 3 listings
INSERT INTO listings (provider_id, category_id, title, description, price, location, is_active, created_at, updated_at) VALUES
((SELECT id FROM users WHERE email = 'amit.sharma@electrician.com'), 6, 'Interior & Exterior Painting', 'Professional painting services for homes, offices, and commercial spaces. Uses Asian Paints, Berger, Dulux, Nerolac. Free color consultation and 2-year warranty on workmanship.', 18.00, 'Delhi NCR', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'amit.sharma@electrician.com'), 6, 'Texture & Designer Wall Painting', 'Specialized in textured walls, wall designs, accent walls, and 3D effects. Latest trending designs. Creates statement walls for living rooms and bedrooms.', 35.00, 'Mumbai', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'amit.sharma@electrician.com'), 6, 'Waterproofing Solutions', 'Complete waterproofing for terrace, bathrooms, walls. Uses Dr.Fixit, Pidilite, and Sika products. 5-year leakage warranty. Free inspection.', 45.00, 'Chennai', TRUE, NOW(), NOW());

-- AC REPAIR (category_id = 7) - 3 listings
INSERT INTO listings (provider_id, category_id, title, description, price, location, is_active, created_at, updated_at) VALUES
((SELECT id FROM users WHERE email = 'amit.sharma@electrician.com'), 7, 'AC Installation & Service', 'Expert AC installation, servicing, and gas refilling. Works with all brands - LG, Samsung, Voltas, Daikin, Hitachi, Bluestar. Same-day service. Annual maintenance contracts available.', 600.00, 'Delhi NCR', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'amit.sharma@electrician.com'), 7, 'Split AC Repair & Maintenance', 'Complete AC repair services including cooling issues, compressor problems, leakage, and electrical faults. Certified technicians. 30-day service warranty.', 800.00, 'Bangalore', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'amit.sharma@electrician.com'), 7, 'Commercial HVAC Service', 'HVAC servicing for offices, shops, restaurants. AMC (Annual Maintenance Contracts) available. Quick response time. Bulk pricing for multiple units.', 1500.00, 'Mumbai', TRUE, NOW(), NOW());

-- GARDENING (category_id = 8) - 3 listings
INSERT INTO listings (provider_id, category_id, title, description, price, location, is_active, created_at, updated_at) VALUES
((SELECT id FROM users WHERE email = 'sunil.verma@cleaner.com'), 8, 'Garden Maintenance & Landscaping', 'Professional garden design, landscaping, and regular maintenance. Includes lawn mowing, plant care, fertilization, pest control. Specializes in terrace gardens.', 1200.00, 'Delhi NCR', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'sunil.verma@cleaner.com'), 8, 'Indoor Plant Service', 'Indoor plant setup, care, and maintenance for offices and homes. Selects plants based on light conditions. Monthly maintenance available.', 800.00, 'Bangalore', TRUE, NOW(), NOW()),
((SELECT id FROM users WHERE email = 'sunil.verma@cleaner.com'), 8, 'Vegetable Garden Setup', 'Setup organic vegetable garden in your terrace or backyard. Includes soil prep, seeds, planters, and 3-month maintenance. Get fresh organic veggies at home!', 3500.00, 'Pune', TRUE, NOW(), NOW());

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 
    'Seed completed!' AS status,
    (SELECT COUNT(*) FROM users WHERE email LIKE '%@%.com' AND role = 'provider') AS total_providers,
    (SELECT COUNT(*) FROM listings) AS total_listings,
    (SELECT COUNT(DISTINCT category_id) FROM listings) AS categories_used;