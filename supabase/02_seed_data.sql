-- ==============================================================================
-- RoyalRides Travels - Initial Seed Data for Demo & Production Setup
-- ==============================================================================

-- 1. SEED CARS
insert into public.cars (id, name, car_type, seating_capacity, image_url, is_active, is_hero_featured, display_order)
values
  ('c1111111-1111-1111-1111-111111111111', 'Innova', 'MPV', '7+1 Seating', '/images/cars/innova.jpg', true, true, 1),
  ('c2222222-2222-2222-2222-222222222222', 'Ertiga', 'MPV', '6+1 Seating', '/images/cars/ertiga.jpg', true, true, 2),
  ('c3333333-3333-3333-3333-333333333333', 'Swift Dzire', 'Sedan', '4+1 Seating', '/images/cars/swift-dzire.jpg', true, true, 3),
  ('c4444444-4444-4444-4444-444444444444', 'Urbania Traveller', 'Luxury Van', '12+1 Seating', '/images/cars/urbania.jpg', true, true, 4)
on conflict (id) do update set
  name = excluded.name,
  car_type = excluded.car_type,
  seating_capacity = excluded.seating_capacity,
  image_url = excluded.image_url,
  is_active = excluded.is_active,
  is_hero_featured = excluded.is_hero_featured,
  display_order = excluded.display_order;

-- 2. SEED ROUTES
insert into public.routes (id, origin, destination, image_url, is_active, is_featured, display_order)
values
  ('r1111111-1111-1111-1111-111111111111', 'Surat', 'Mumbai Airport', '/images/airport-transfer.jpg', true, true, 1),
  ('r2222222-2222-2222-2222-222222222222', 'Surat', 'Pune', null, true, true, 2),
  ('r3333333-3333-3333-3333-333333333333', 'Surat', 'Ahmedabad', null, true, true, 3),
  ('r4444444-4444-4444-4444-444444444444', 'Surat', 'Udaipur', null, true, true, 4),
  ('r5555555-5555-5555-5555-555555555555', 'Surat', 'Nashik', null, true, true, 5)
on conflict (id) do update set
  origin = excluded.origin,
  destination = excluded.destination,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured,
  display_order = excluded.display_order;

-- 3. SEED ROUTE VEHICLE PRICES (Exact verified client rates)
-- Surat -> Mumbai Airport: Swift Dzire: 7000, Ertiga: 8000, Innova: 13000, Urbania: null (Get a Quote)
insert into public.route_prices (route_id, car_id, price)
values
  ('r1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', 7000.00), -- Swift Dzire
  ('r1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', 8000.00), -- Ertiga
  ('r1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 13000.00), -- Innova
  ('r1111111-1111-1111-1111-111111111111', 'c4444444-4444-4444-4444-444444444444', null), -- Urbania: Get a Quote
  -- Other routes demo baseline pricing
  ('r2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 9500.00),
  ('r3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 6000.00),
  ('r4444444-4444-4444-4444-444444444444', 'c1111111-1111-1111-1111-111111111111', 12000.00),
  ('r5555555-5555-5555-5555-555555555555', 'c2222222-2222-2222-2222-222222222222', 7000.00)
on conflict (route_id, car_id) do update set
  price = excluded.price;

-- 4. SEED DESTINATIONS
insert into public.destinations (id, name, description, image_url, is_published, display_order)
values
  ('d1111111-1111-1111-1111-111111111111', 'Mumbai', 'Financial capital, Marine Drive & Gateway of India.', '/images/destinations/mumbai.jpg', true, 1),
  ('d2222222-2222-2222-2222-222222222222', 'Lonavala', 'Scenic misty Western Ghats, valleys & waterfalls.', '/images/destinations/lonavala.jpg', true, 2),
  ('d3333333-3333-3333-3333-333333333333', 'Nashik', 'Wine capital and sacred pilgrimage temples along Godavari.', '/images/destinations/nashik.jpg', true, 3),
  ('d4444444-4444-4444-4444-444444444444', 'Statue of Unity', 'World’s tallest statue overlooking the serene Narmada river.', '/images/destinations/statue-of-unity.jpg', true, 4),
  ('d5555555-5555-5555-5555-555555555555', 'Somnath', 'Magnificent oceanfront Jyotirlinga temple shrine.', '/images/destinations/somnath.jpg', true, 5),
  ('d6666666-6666-6666-6666-666666666666', 'Diu', 'Sun-kissed beaches, golden sand, and historic sea fort.', '/images/destinations/diu.jpg', true, 6)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url,
  is_published = excluded.is_published,
  display_order = excluded.display_order;

-- 5. SEED REVIEWS (Marked as demo content)
insert into public.reviews (id, customer_name, rating, review_text, avatar_url, is_published, is_demo, display_order)
values
  ('rv111111-1111-1111-1111-111111111111', 'Rohit Patel', 5, 'Excellent service! On-time pickup and very professional driver. Highly recommended!', null, true, true, 1),
  ('rv222222-2222-2222-2222-222222222222', 'Priya Shah', 5, 'Very comfortable journey to Mumbai Airport. Clean car and great service.', null, true, true, 2),
  ('rv333333-3333-3333-3333-333333333333', 'Amit Desai', 5, 'Booked Innova for family trip. Smooth ride and great experience. Will book again!', null, true, true, 3),
  ('rv444444-4444-4444-4444-444444444444', 'Neha Modi', 5, 'Traveled from Surat to Udaipur with family. Driver was punctual and courteous.', null, true, true, 4)
on conflict (id) do update set
  customer_name = excluded.customer_name,
  rating = excluded.rating,
  review_text = excluded.review_text,
  is_published = excluded.is_published;

-- 6. SEED DEMO INQUIRIES
insert into public.inquiries (id, customer_name, phone, pickup_location, destination, travel_date, travel_time, car_name, car_id, passengers, trip_type, status, source)
values
  ('in111111-1111-1111-1111-111111111111', 'Rahul Patel', '9876543210', 'Surat', 'Mumbai Airport', current_date + interval '2 days', '06:00 AM', 'Innova', 'c1111111-1111-1111-1111-111111111111', 6, 'one-way', 'New', 'website'),
  ('in222222-2222-2222-2222-222222222222', 'Priya Shah', '9876123456', 'Surat', 'Pune', current_date + interval '3 days', '08:30 AM', 'Ertiga', 'c2222222-2222-2222-2222-222222222222', 4, 'round-trip', 'Contacted', 'website'),
  ('in333333-3333-3333-3333-333333333333', 'Amit Desai', '9876987654', 'Surat', 'Ahmedabad', current_date + interval '5 days', '09:00 AM', 'Swift Dzire', 'c3333333-3333-3333-3333-333333333333', 4, 'one-way', 'New', 'website'),
  ('in444444-4444-4444-4444-444444444444', 'Neha Modi', '9876456789', 'Surat', 'Udaipur', current_date + interval '7 days', '05:00 AM', 'Innova', 'c1111111-1111-1111-1111-111111111111', 5, 'round-trip', 'Quotation Given', 'phone'),
  ('in555555-5555-5555-5555-555555555555', 'Kunal Mehta', '9876765432', 'Surat', 'Mumbai', current_date + interval '10 days', '07:00 AM', 'Urbania Traveller', 'c4444444-4444-4444-4444-444444444444', 12, 'one-way', 'Confirmed', 'whatsapp')
on conflict (id) do nothing;

-- 7. SEED SITE SETTINGS
insert into public.site_settings (id, agency_name, tagline, phone, whatsapp, email, address, logo_url, cta_text)
values
  ('default', 'RoyalRides Travels', 'Comfortable Rides for Every Journey', '+91 98765 43210', '+91 98765 43210', 'contact@royalridestravels.com', 'Ring Road, Surat, Gujarat 395002', null, 'Book Your Ride')
on conflict (id) do update set
  agency_name = excluded.agency_name,
  tagline = excluded.tagline,
  phone = excluded.phone,
  whatsapp = excluded.whatsapp,
  email = excluded.email,
  address = excluded.address;

-- 8. SEED HOMEPAGE SECTIONS
insert into public.homepage_sections (id, title, subtitle, badge, body, image_url)
values
  ('hero', 'Comfortable Rides for Every Journey', 'Airport Transfers, Outstation Trips, City Travel and More', 'PREMIUM CHAUFFEUR DRIVEN CAR RENTAL', 'Experience effortless, punctual, and safe road journeys with our professionally driven fleet of modern cars.', '/images/hero-bg.jpg'),
  ('about', 'Premium Chauffeur-Driven Travel Services', 'Dedicated to Comfort, Safety, and Reliable Road Journeys', 'ABOUT ROYALRIDES', 'RoyalRides Travels is a premium car rental and travel agency specializing in outstation travel, airport transfers, corporate transit, and family tours. Our fleet of meticulously maintained vehicles and seasoned, courteous chauffeurs ensure you travel in absolute comfort and peace of mind.', null),
  ('contact', 'Ready to Plan Your Journey?', 'Get in touch with our team for quick quotes, custom itineraries, and reservations.', 'CONTACT US', 'Available 24/7 for emergency bookings, corporate packages, and outstation inquiries.', null)
on conflict (id) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  badge = excluded.badge,
  body = excluded.body,
  image_url = excluded.image_url;
