'use client';

import { Car, Route, Destination, Review, Inquiry, SiteSettings, HomepageSection, InquiryFormInput } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase/client';
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  REALTIME_SUBSCRIBE_STATES,
} from '@supabase/supabase-js';
import {
  DEFAULT_HERO_BG,
  DEFAULT_AIRPORT_TRANSFER,
  DEFAULT_ABOUT_IMG,
  DESTINATION_IMAGES,
  VEHICLE_IMAGES,
  migrateLegacyImagePath,
} from './constants/default-images';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Initial authoritative seed data with complete fleet details matching references
const INITIAL_CARS: Car[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Toyota Innova Crysta',
    slug: 'innova',
    manufacturer: 'Toyota',
    model: 'Innova Crysta',
    car_type: 'MPV',
    category: 'MPV',
    seating_capacity: '7 Seats',
    image_url: VEHICLE_IMAGES['innova'].transparent,
    hero_image_url: VEHICLE_IMAGES['innova'].transparent,
    gallery_images: VEHICLE_IMAGES['innova'].gallery,
    badge: 'MOST POPULAR',
    rating: 4.9,
    review_count: '1,450+',
    completed_tours: '1,450+ Completed Tours',
    tagline: 'TOYOTA • LUXURY MPV EDITION',
    short_description: 'The undisputed highway king for comfortable family and executive travel.',
    description: 'The Toyota Innova Crysta offers unmatched comfort, robust highway performance, and premium leather captain seating. Perfect for long outstation tours and airport journeys.',
    outstation_price_per_km: 18,
    daily_package_price: 4500,
    min_km_per_day: 'Min. 250-300 kms/day',
    package_hours: '8 Hours',
    package_included_km: '80 km Included',
    driver_allowance: 300,
    extra_km_charge: 18,
    extra_hour_charge: 200,
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    engine: '2.4L GD Turbo Diesel',
    horsepower: '148 HP',
    max_speed: '180 km/h',
    driver_option: 'Chauffeur / Self-Drive',
    luggage_capacity: '3-4 Large Trolleys',
    highlights: [
      'Ideal for Surat - Mumbai & Udaipur road trips',
      'Spacious cabin with rear AC vents',
      'Reclining middle row captain seats',
    ],
    key_features: [
      'Uniformed, commercial license verified highway chauffeur',
      'Automated Expressway Fastag pass - Zero roadside stops',
      '100% Sanitized cabin - Chilled mineral water included',
    ],
    amenities: [
      'Captain Reclining Seats',
      'Dual Air Conditioning',
      'Fast USB Chargers',
      'Spacious Luggage Boot',
      'Professional Highway Chauffeur',
      'Bluetooth Audio System',
    ],
    is_active: true,
    is_hero_featured: true,
    display_order: 1,
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Maruti Suzuki Ertiga',
    slug: 'ertiga',
    manufacturer: 'Maruti Suzuki',
    model: 'Ertiga',
    car_type: 'MPV',
    category: 'MPV',
    seating_capacity: '7 Seats',
    image_url: VEHICLE_IMAGES['ertiga'].transparent,
    hero_image_url: VEHICLE_IMAGES['ertiga'].transparent,
    gallery_images: VEHICLE_IMAGES['ertiga'].gallery,
    badge: 'FAMILY FAVORITE',
    rating: 4.8,
    review_count: '1,120+',
    completed_tours: '1,120+ Completed Tours',
    tagline: 'MARUTI SUZUKI • SMART HYBRID EDITION',
    short_description: 'Smart, versatile 7-seater MPV engineered for economical family getaways.',
    description: 'Maruti Suzuki Ertiga provides flexible 7-passenger seating, whisper-quiet cabin ride, and incredible fuel efficiency for city and intercity travel.',
    outstation_price_per_km: 14,
    daily_package_price: 3500,
    min_km_per_day: 'Min. 250-300 kms/day',
    package_hours: '8 Hours',
    package_included_km: '80 km Included',
    driver_allowance: 300,
    extra_km_charge: 14,
    extra_hour_charge: 150,
    fuel_type: 'Petrol / CNG',
    transmission: 'Manual',
    engine: '1.5L K15C Smart Hybrid',
    horsepower: '102 HP',
    max_speed: '160 km/h',
    driver_option: 'Chauffeur / Self-Drive',
    luggage_capacity: '2-3 Trolley Bags',
    highlights: [
      'Economical long distance touring',
      'Flexible 3-row seating configuration',
      'Cooled cupholders & roof AC vents',
    ],
    key_features: [
      'Uniformed, commercial license verified highway chauffeur',
      'Automated Expressway Fastag pass - Zero roadside stops',
      '100% Sanitized cabin - Chilled mineral water included',
    ],
    amenities: [
      'Air Conditioning with Rear Blower',
      'Reclining 2nd Row Seats',
      'USB Fast Charging',
      'Clean Fresh Cabin',
      'Professional Highway Chauffeur',
    ],
    is_active: true,
    is_hero_featured: true,
    display_order: 2,
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Maruti Suzuki Swift Dzire',
    slug: 'swift-dzire',
    manufacturer: 'Maruti Suzuki',
    model: 'Swift Dzire',
    car_type: 'Sedan',
    category: 'Sedan',
    seating_capacity: '4 Seats',
    image_url: VEHICLE_IMAGES['swift-dzire'].transparent,
    hero_image_url: VEHICLE_IMAGES['swift-dzire'].transparent,
    gallery_images: VEHICLE_IMAGES['swift-dzire'].gallery,
    badge: 'MOST ECONOMICAL',
    rating: 4.9,
    review_count: '2,350+',
    completed_tours: '2,350+ Completed Tours',
    tagline: 'MARUTI SUZUKI • COMPACT SEDAN EDITION',
    short_description: 'Premium compact sedan ideal for airport drops, corporate transit, and couples.',
    description: 'The Swift Dzire is India’s top choice for comfortable, pocket-friendly point-to-point transit with excellent legroom and dedicated trunk luggage space.',
    outstation_price_per_km: 11,
    daily_package_price: 2400,
    min_km_per_day: 'Min. 250-300 kms/day',
    package_hours: '8 Hours',
    package_included_km: '80 km Included',
    driver_allowance: 300,
    extra_km_charge: 11,
    extra_hour_charge: 120,
    fuel_type: 'Petrol / CNG',
    transmission: 'Manual',
    engine: '1.2L DualJet Dual VVT',
    horsepower: '89 HP',
    max_speed: '170 km/h',
    driver_option: 'Chauffeur / Self-Drive',
    luggage_capacity: '2 Large Suitcases',
    highlights: [
      'Pocket-friendly outstation rates',
      'Smooth city maneuverability',
      '378L dedicated boot space',
    ],
    key_features: [
      'Uniformed, commercial license verified highway chauffeur',
      'Automated Expressway Fastag pass - Zero roadside stops',
      '100% Sanitized cabin - Chilled mineral water included',
    ],
    amenities: [
      'Automatic Climate Control',
      'Rear Seat Armrest',
      'Mobile Fast Charging',
      'Punctual Chauffeur',
      'Bluetooth Audio',
    ],
    is_active: true,
    is_hero_featured: true,
    display_order: 3,
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Urbania Traveller',
    slug: 'urbania',
    manufacturer: 'Force',
    model: 'Urbania',
    car_type: 'Luxury Van',
    category: 'Tempo Traveller',
    seating_capacity: '12+1 Seats',
    image_url: VEHICLE_IMAGES['urbania'].transparent,
    hero_image_url: VEHICLE_IMAGES['urbania'].transparent,
    gallery_images: VEHICLE_IMAGES['urbania'].gallery,
    badge: 'PREMIUM VAN',
    rating: 5.0,
    review_count: '400+',
    completed_tours: '400+ Completed Tours',
    tagline: 'FORCE • TEMPO TRAVELLER EDITION',
    short_description: 'World-class luxury multi-seater for VIP delegations, weddings, and group expeditions.',
    description: 'Engineered with aerodynamic monocoque chassis, ultra-luxurious captain reclining seats, individual AC vents, and massive panoramic touring windows.',
    outstation_price_per_km: 60,
    daily_package_price: 25000,
    min_km_per_day: 'Min. 250-300 kms/day',
    package_hours: '8 Hours',
    package_included_km: '80 km Included',
    driver_allowance: 500,
    extra_km_charge: 60,
    extra_hour_charge: 500,
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    engine: 'High Output',
    horsepower: 'High Output',
    max_speed: '240 km/h',
    driver_option: 'Chauffeur / Self-Drive',
    luggage_capacity: '3-5 Large Trolleys',
    highlights: [
      'Ideal for Surat - Mumbai & Udaipur road trips',
      'Monocoque body with German engineering',
      'Independent front suspension for airplane-like ride',
    ],
    key_features: [
      'Uniformed, commercial license verified highway chauffeur',
      'Automated Expressway Fastag pass - Zero roadside stops',
      '100% Sanitized cabin - Chilled mineral water included',
    ],
    amenities: [
      'Captain Reclining Seats',
      'Dual Air Conditioning',
      'Fast USB Chargers',
      'Spacious Luggage Boot',
      'Professional Highway Chauffeur',
      'Air Suspension',
    ],
    is_active: true,
    is_hero_featured: true,
    display_order: 4,
  },
];

const INITIAL_ROUTES: Route[] = [
  {
    id: 'r1111111-1111-1111-1111-111111111111',
    origin: 'Surat',
    destination: 'Mumbai Airport',
    image_url: DEFAULT_AIRPORT_TRANSFER,
    is_active: true,
    is_featured: true,
    display_order: 1,
    prices: [
      { id: 'rp-1', route_id: 'r1111111-1111-1111-1111-111111111111', car_id: 'c3333333-3333-3333-3333-333333333333', price: 7000 },
      { id: 'rp-2', route_id: 'r1111111-1111-1111-1111-111111111111', car_id: 'c2222222-2222-2222-2222-222222222222', price: 8000 },
      { id: 'rp-3', route_id: 'r1111111-1111-1111-1111-111111111111', car_id: 'c1111111-1111-1111-1111-111111111111', price: 13000 },
      { id: 'rp-4', route_id: 'r1111111-1111-1111-1111-111111111111', car_id: 'c4444444-4444-4444-4444-444444444444', price: null }, // Urbania: Get a Quote
    ],
  },
  {
    id: 'r2222222-2222-2222-2222-222222222222',
    origin: 'Surat',
    destination: 'Pune',
    is_active: true,
    is_featured: true,
    display_order: 2,
    prices: [
      { id: 'rp-5', route_id: 'r2222222-2222-2222-2222-222222222222', car_id: 'c2222222-2222-2222-2222-222222222222', price: 9500 },
    ],
  },
  {
    id: 'r3333333-3333-3333-3333-333333333333',
    origin: 'Surat',
    destination: 'Ahmedabad',
    is_active: true,
    is_featured: true,
    display_order: 3,
    prices: [
      { id: 'rp-6', route_id: 'r3333333-3333-3333-3333-333333333333', car_id: 'c3333333-3333-3333-3333-333333333333', price: 6000 },
    ],
  },
  {
    id: 'r4444444-4444-4444-4444-444444444444',
    origin: 'Surat',
    destination: 'Udaipur',
    is_active: true,
    is_featured: true,
    display_order: 4,
    prices: [
      { id: 'rp-7', route_id: 'r4444444-4444-4444-4444-444444444444', car_id: 'c1111111-1111-1111-1111-111111111111', price: 12000 },
    ],
  },
  {
    id: 'r5555555-5555-5555-5555-555555555555',
    origin: 'Surat',
    destination: 'Nashik',
    is_active: true,
    is_featured: true,
    display_order: 5,
    prices: [
      { id: 'rp-8', route_id: 'r5555555-5555-5555-5555-555555555555', car_id: 'c2222222-2222-2222-2222-222222222222', price: 7000 },
    ],
  },
];

const INITIAL_DESTINATIONS: Destination[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    name: 'Mumbai',
    description: 'Financial capital, Marine Drive & Gateway of India.',
    image_url: DESTINATION_IMAGES.mumbai,
    is_published: true,
    display_order: 1,
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    name: 'Lonavala',
    description: 'Scenic misty Western Ghats, valleys & waterfalls.',
    image_url: DESTINATION_IMAGES.lonavala,
    is_published: true,
    display_order: 2,
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    name: 'Nashik',
    description: 'Wine capital and sacred pilgrimage temples along Godavari.',
    image_url: DESTINATION_IMAGES.nashik,
    is_published: true,
    display_order: 3,
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    name: 'Statue of Unity',
    description: 'World’s tallest statue overlooking the serene Narmada river.',
    image_url: DESTINATION_IMAGES['statue-of-unity'],
    is_published: true,
    display_order: 4,
  },
  {
    id: 'd5555555-5555-5555-5555-555555555555',
    name: 'Somnath',
    description: 'Magnificent oceanfront Jyotirlinga temple shrine.',
    image_url: DESTINATION_IMAGES.somnath,
    is_published: true,
    display_order: 5,
  },
  {
    id: 'd6666666-6666-6666-6666-666666666666',
    name: 'Diu',
    description: 'Sun-kissed beaches, golden sand, and historic sea fort.',
    image_url: DESTINATION_IMAGES.diu,
    is_published: true,
    display_order: 6,
  },
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rv1',
    customer_name: 'Rohit Patel',
    rating: 5,
    review_text: 'Excellent service! On-time pickup and very professional driver. Highly recommended!',
    is_published: true,
    is_demo: true,
    display_order: 1,
  },
  {
    id: 'rv2',
    customer_name: 'Priya Shah',
    rating: 5,
    review_text: 'Very comfortable journey to Mumbai Airport. Clean car and great service.',
    is_published: true,
    is_demo: true,
    display_order: 2,
  },
  {
    id: 'rv3',
    customer_name: 'Amit Desai',
    rating: 5,
    review_text: 'Booked Innova for family trip. Smooth ride and great experience. Will book again!',
    is_published: true,
    is_demo: true,
    display_order: 3,
  },
  {
    id: 'rv4',
    customer_name: 'Neha Modi',
    rating: 5,
    review_text: 'Traveled from Surat to Udaipur with family. Driver was punctual and courteous.',
    is_published: true,
    is_demo: true,
    display_order: 4,
  },
];

const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'in1',
    customer_name: 'Rahul Patel',
    phone: '9876543210',
    pickup_location: 'Surat',
    destination: 'Mumbai',
    travel_date: '2024-10-25',
    travel_time: '06:00 AM',
    car_name: 'Innova',
    car_id: 'c1111111-1111-1111-1111-111111111111',
    passengers: 6,
    trip_type: 'one-way',
    status: 'New',
    source: 'website',
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 'in2',
    customer_name: 'Priya Shah',
    phone: '9876123456',
    pickup_location: 'Surat',
    destination: 'Pune',
    travel_date: '2024-10-26',
    travel_time: '08:30 AM',
    car_name: 'Ertiga',
    car_id: 'c2222222-2222-2222-2222-222222222222',
    passengers: 4,
    trip_type: 'round-trip',
    status: 'Contacted',
    source: 'website',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'in3',
    customer_name: 'Amit Desai',
    phone: '9876987654',
    pickup_location: 'Surat',
    destination: 'Ahmedabad',
    travel_date: '2024-10-28',
    travel_time: '09:00 AM',
    car_name: 'Swift Dzire',
    car_id: 'c3333333-3333-3333-3333-333333333333',
    passengers: 4,
    trip_type: 'one-way',
    status: 'New',
    source: 'website',
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'in4',
    customer_name: 'Neha Modi',
    phone: '9876456789',
    pickup_location: 'Surat',
    destination: 'Udaipur',
    travel_date: '2024-10-30',
    travel_time: '05:00 AM',
    car_name: 'Innova',
    car_id: 'c1111111-1111-1111-1111-111111111111',
    passengers: 5,
    trip_type: 'round-trip',
    status: 'Quotation Given',
    source: 'phone',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'in5',
    customer_name: 'Kunal Mehta',
    phone: '9876765432',
    pickup_location: 'Surat',
    destination: 'Mumbai',
    travel_date: '2024-10-31',
    travel_time: '07:00 AM',
    car_name: 'Urbania',
    car_id: 'c4444444-4444-4444-4444-444444444444',
    passengers: 12,
    trip_type: 'one-way',
    status: 'Confirmed',
    source: 'whatsapp',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

const INITIAL_SETTINGS: SiteSettings = {
  id: 'default',
  agency_name: 'RoyalRides Travels',
  tagline: 'Comfortable Rides for Every Journey',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'contact@royalridestravels.com',
  address: 'Ring Road, Surat, Gujarat 395002',
  logo_url: null,
  facebook_url: 'https://facebook.com',
  instagram_url: 'https://instagram.com',
  youtube_url: 'https://youtube.com',
  cta_text: 'Book Your Ride',
};

const INITIAL_CONTENT: Record<string, HomepageSection> = {
  hero: {
    id: 'hero',
    title: 'Comfortable Rides for Every Journey',
    subtitle: 'Airport Transfers • Outstation Trips • City Travel & More',
    badge: 'PREMIUM CHAUFFEUR-DRIVEN CAR RENTAL',
    body: 'Experience effortless, punctual, and safe road journeys with our professionally driven fleet of modern cars.',
    image_url: DEFAULT_HERO_BG,
  },
  features: {
    id: 'features',
    title: 'Why Choose RoyalRides',
    subtitle: 'Excellence in Every Mile',
    badge: 'OUR PROMISE',
    body: 'Punctual door-to-door pickups, sanitized and comfortable vehicles, experienced vetted chauffeurs, and transparent billing.',
  },
  about: {
    id: 'about',
    title: 'Premium Chauffeur-Driven Travel Services',
    subtitle: 'Dedicated to Comfort, Safety, and Reliable Road Journeys',
    badge: 'ABOUT ROYALRIDES',
    body: 'RoyalRides Travels is a premium car rental and travel agency specializing in outstation travel, airport transfers, corporate transit, and family tours. Our fleet of meticulously maintained vehicles and seasoned, courteous chauffeurs ensure you travel in absolute comfort and peace of mind.',
    image_url: DEFAULT_ABOUT_IMG,
  },
  contact: {
    id: 'contact',
    title: 'Ready to Plan Your Journey?',
    subtitle: 'Get in touch with our team for quick quotes, custom itineraries, and reservations.',
    badge: 'CONTACT US',
    body: 'Available 24/7 for emergency bookings, corporate packages, and outstation inquiries.',
  },
};

// Local storage keys
const STORAGE_KEYS = {
  CARS: 'rr_cars',
  ROUTES: 'rr_routes',
  DESTINATIONS: 'rr_destinations',
  REVIEWS: 'rr_reviews',
  INQUIRIES: 'rr_inquiries',
  SETTINGS: 'rr_settings',
  CONTENT: 'rr_content',
};

// Safe browser local storage helpers
function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err: any) {
    console.warn('Storage write error, attempting quota recovery:', err);
    try {
      // 1. Evict any oversized raw base64 data from other keys
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith('rr_') && k !== key) {
          const val = localStorage.getItem(k);
          if (val && val.length > 100000) {
            localStorage.removeItem(k);
          }
        }
      }

      // 2. Try writing again
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      try {
        // 3. If still failing, sanitize `data` itself: replace any gigantic (>100KB) data URLs
        const sanitized = JSON.parse(
          JSON.stringify(data, (_k, v) => {
            if (typeof v === 'string' && v.startsWith('data:') && v.length > 100000) {
              return DEFAULT_ABOUT_IMG;
            }
            return v;
          })
        );
        localStorage.setItem(key, JSON.stringify(sanitized));
      } catch (finalErr) {
        console.error('LocalStorage write failed after all quota recovery attempts:', finalErr);
      }
    }
  }

  try {
    // Broadcast event across browser tabs
    const bc = new BroadcastChannel('rr_sync_channel');
    bc.postMessage({ type: 'SYNC_UPDATE', key });
    bc.close();
    // Dispatch local custom event
    window.dispatchEvent(new CustomEvent('rr_store_change', { detail: { key } }));

    // Non-blocking on-demand Next.js server cache purge
    try {
      fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/' }),
      }).catch(() => {
        // Silently tolerate if offline or sandboxed
      });
    } catch {
      // Ignore background fetch error
    }
  } catch (syncErr) {
    console.warn('Sync broadcast warning:', syncErr);
  }
}

export const DataStore = {
  enrichCarWithDefaults(car: Car): Car {
    const match = INITIAL_CARS.find(
      (c) => c.id === car.id || c.name.toLowerCase() === car.name.toLowerCase() || (c.slug && c.slug === car.slug)
    );

    const slug = car.slug || (match?.slug) || slugify(car.name);
    const category = car.category || (match?.category) || car.car_type || 'MPV';
    const manufacturer = car.manufacturer || (match?.manufacturer) || (car.name.split(' ')[0] || 'RoyalRides');
    const model = car.model || (match?.model) || car.name;
    const badge = car.badge !== undefined ? car.badge : (match?.badge || '');
    const rating = car.rating !== undefined ? car.rating : (match?.rating || 4.9);
    const review_count = car.review_count !== undefined ? car.review_count : (match?.review_count || '1,000+');
    const completed_tours = car.completed_tours !== undefined ? car.completed_tours : (match?.completed_tours || '500+ Completed Tours');
    const tagline = car.tagline || (match?.tagline) || `${manufacturer.toUpperCase()} • ${category.toUpperCase()} EDITION`;
    const short_description = car.short_description || (match?.short_description) || `Chauffeur-driven ${car.name} for outstation travel and city transfers.`;
    const description = car.description || (match?.description) || `Experience superior travel comfort with the ${car.name}. Professionally maintained with seasoned highway chauffeur.`;
    const outstation_price_per_km = car.outstation_price_per_km !== undefined ? car.outstation_price_per_km : (match?.outstation_price_per_km ?? 15);
    const daily_package_price = car.daily_package_price !== undefined ? car.daily_package_price : (match?.daily_package_price ?? 3500);
    const min_km_per_day = car.min_km_per_day || (match?.min_km_per_day) || 'Min. 250-300 kms/day';
    const package_hours = car.package_hours || (match?.package_hours) || '8 Hours';
    const package_included_km = car.package_included_km || (match?.package_included_km) || '80 km Included';
    const driver_allowance = car.driver_allowance !== undefined ? car.driver_allowance : (match?.driver_allowance ?? 300);
    const extra_km_charge = car.extra_km_charge !== undefined ? car.extra_km_charge : (match?.extra_km_charge ?? outstation_price_per_km);
    const extra_hour_charge = car.extra_hour_charge !== undefined ? car.extra_hour_charge : (match?.extra_hour_charge ?? 150);
    const fuel_type = car.fuel_type || (match?.fuel_type) || 'Diesel';
    const transmission = car.transmission || (match?.transmission) || 'Manual';
    const engine = car.engine || (match?.engine) || 'High Output';
    const horsepower = car.horsepower || (match?.horsepower) || 'High Output';
    const max_speed = car.max_speed || (match?.max_speed) || '180 km/h';
    const driver_option = car.driver_option || (match?.driver_option) || 'Chauffeur / Self-Drive';
    const luggage_capacity = car.luggage_capacity || (match?.luggage_capacity) || '3-4 Large Trolleys';
    const highlights = car.highlights && car.highlights.length > 0 ? car.highlights : (match?.highlights || ['Ideal for Surat - Mumbai & Udaipur road trips', 'Comfortable highway suspension', 'Fully sanitized cabin']);
    const key_features = car.key_features && car.key_features.length > 0 ? car.key_features : (match?.key_features || [
      'Uniformed, commercial license verified highway chauffeur',
      'Automated Expressway Fastag pass - Zero roadside stops',
      '100% Sanitized cabin - Chilled mineral water included',
    ]);
    const amenities = car.amenities && car.amenities.length > 0 ? car.amenities : (match?.amenities || [
      'Captain Reclining Seats',
      'Dual Air Conditioning',
      'Fast USB Chargers',
      'Spacious Luggage Boot',
      'Professional Highway Chauffeur',
    ]);
    const image_url = migrateLegacyImagePath(car.image_url, 'car');
    const hero_image_url = migrateLegacyImagePath(car.hero_image_url || car.image_url, 'car');
    const gallery_images = (car.gallery_images && car.gallery_images.length > 0 ? car.gallery_images : (match?.gallery_images || [image_url]))
      .map((img) => migrateLegacyImagePath(img, 'car'));

    return {
      ...car,
      image_url,
      hero_image_url,
      slug,
      category,
      manufacturer,
      model,
      badge,
      rating,
      review_count,
      completed_tours,
      tagline,
      short_description,
      description,
      outstation_price_per_km,
      daily_package_price,
      min_km_per_day,
      package_hours,
      package_included_km,
      driver_allowance,
      extra_km_charge,
      extra_hour_charge,
      fuel_type,
      transmission,
      engine,
      horsepower,
      max_speed,
      driver_option,
      luggage_capacity,
      highlights,
      key_features,
      amenities,
      gallery_images,
    };
  },

  // CARS
  async getCars(): Promise<Car[]> {
    let cars: Car[] = [];
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) cars = data;
    }
    if (cars.length === 0) {
      cars = getStorage<Car[]>(STORAGE_KEYS.CARS, INITIAL_CARS);
    }
    return cars.map((c) => this.enrichCarWithDefaults(c));
  },

  async getCarBySlug(slug: string): Promise<Car | null> {
    const cars = await this.getCars();
    const cleanSlug = slug.toLowerCase().trim();
    const found = cars.find(
      (c) =>
        (c.slug && c.slug.toLowerCase() === cleanSlug) ||
        c.id === cleanSlug ||
        slugify(c.name) === cleanSlug ||
        c.name.toLowerCase() === cleanSlug
    );
    return found || null;
  },

  async saveCar(car: Partial<Car>): Promise<Car> {
    const cars = await this.getCars();
    let updatedCar: Car;
    const computedSlug = car.slug || (car.name ? slugify(car.name) : undefined);

    if (car.id) {
      const index = cars.findIndex((c) => c.id === car.id);
      if (index !== -1) {
        const existing = cars[index];
        const finalImg = car.image_url !== undefined && car.image_url !== '' ? car.image_url : existing.image_url;
        const finalHeroImg = car.hero_image_url !== undefined && car.hero_image_url !== '' ? car.hero_image_url : existing.hero_image_url;
        const finalGallery = car.gallery_images && car.gallery_images.length > 0 ? car.gallery_images : existing.gallery_images;
        updatedCar = {
          ...existing,
          ...car,
          image_url: finalImg,
          hero_image_url: finalHeroImg,
          gallery_images: finalGallery,
          slug: computedSlug || existing.slug || slugify(existing.name),
        } as Car;
        cars[index] = updatedCar;
      } else {
        updatedCar = this.enrichCarWithDefaults({
          id: car.id,
          name: car.name || 'New Car',
          slug: computedSlug || slugify(car.name || 'New Car'),
          car_type: car.car_type || 'MPV',
          seating_capacity: car.seating_capacity || '7+1 Seating',
          image_url: car.image_url || VEHICLE_IMAGES['innova'].primary,
          hero_image_url: car.hero_image_url || car.image_url || VEHICLE_IMAGES['innova'].transparent,
          is_active: car.is_active ?? true,
          is_hero_featured: car.is_hero_featured ?? true,
          display_order: car.display_order || cars.length + 1,
          ...car,
        } as Car);
        cars.push(updatedCar);
      }
    } else {
      const newId = 'car_' + Date.now();
      updatedCar = this.enrichCarWithDefaults({
        id: newId,
        name: car.name || 'New Car',
        slug: computedSlug || slugify(car.name || 'New Car'),
        car_type: car.car_type || 'MPV',
        seating_capacity: car.seating_capacity || '7+1 Seating',
        image_url: car.image_url || VEHICLE_IMAGES['innova'].primary,
        hero_image_url: car.hero_image_url || car.image_url || VEHICLE_IMAGES['innova'].transparent,
        is_active: car.is_active ?? true,
        is_hero_featured: car.is_hero_featured ?? true,
        display_order: cars.length + 1,
        ...car,
      } as Car);
      cars.push(updatedCar);
    }
    setStorage(STORAGE_KEYS.CARS, cars);

    if (isSupabaseConfigured() && supabase) {
      const isClientTempId = updatedCar.id.startsWith('car_');
      const carPayload = {
        ...(isClientTempId ? {} : { id: updatedCar.id }),
        name: updatedCar.name,
        car_type: updatedCar.car_type,
        seating_capacity: updatedCar.seating_capacity,
        image_url: updatedCar.image_url,
        hero_image_url: updatedCar.hero_image_url,
        is_active: updatedCar.is_active,
        is_hero_featured: updatedCar.is_hero_featured,
        display_order: updatedCar.display_order,
      };

      const { data, error } = await supabase
        .from('cars')
        .upsert(carPayload)
        .select()
        .single();

      if (error) {
        // Fallback retry if hero_image_url column is not yet present in Supabase
        const { hero_image_url, ...fallbackPayload } = carPayload;
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('cars')
          .upsert(fallbackPayload)
          .select()
          .single();
        if (fallbackError) {
          throw new Error(fallbackError.message || 'Failed to save car to Supabase');
        } else if (fallbackData?.id) {
          updatedCar.id = fallbackData.id;
          setStorage(STORAGE_KEYS.CARS, cars);
        }
      } else if (data?.id) {
        updatedCar.id = data.id;
        setStorage(STORAGE_KEYS.CARS, cars);
      }
    }
    return updatedCar;
  },

  async deleteCar(id: string): Promise<void> {
    const cars = (await this.getCars()).filter((c) => c.id !== id);
    setStorage(STORAGE_KEYS.CARS, cars);
    if (isSupabaseConfigured() && supabase) {
      if (!id.startsWith('car_')) {
        await supabase.from('cars').delete().eq('id', id);
      }
    }
  },

  // ROUTES
  async getRoutes(): Promise<Route[]> {
    let routes: Route[] = [];
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('routes')
        .select('*, prices:route_prices(*)')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) routes = data;
    }
    if (routes.length === 0) {
      routes = getStorage<Route[]>(STORAGE_KEYS.ROUTES, INITIAL_ROUTES);
    }
    return routes.map((r) => ({
      ...r,
      image_url: r.image_url ? migrateLegacyImagePath(r.image_url, 'route') : r.image_url,
    }));
  },

  async saveRoute(route: Partial<Route>): Promise<Route> {
    const routes = await this.getRoutes();
    let updatedRoute: Route;
    if (route.id) {
      const index = routes.findIndex((r) => r.id === route.id);
      if (index !== -1) {
        const existing = routes[index];
        const finalImg = route.image_url !== undefined && route.image_url !== '' ? route.image_url : existing.image_url;
        updatedRoute = {
          ...existing,
          ...route,
          image_url: finalImg,
        } as Route;
        routes[index] = updatedRoute;
      } else {
        updatedRoute = {
          id: route.id,
          origin: route.origin || 'Surat',
          destination: route.destination || 'Destination',
          image_url: route.image_url,
          is_active: route.is_active ?? true,
          is_featured: route.is_featured ?? true,
          display_order: route.display_order || routes.length + 1,
          prices: route.prices || [],
        };
        routes.push(updatedRoute);
      }
    } else {
      updatedRoute = {
        id: 'rt_' + Date.now(),
        origin: route.origin || 'Surat',
        destination: route.destination || 'Destination',
        image_url: route.image_url,
        is_active: route.is_active ?? true,
        is_featured: route.is_featured ?? true,
        display_order: routes.length + 1,
        prices: route.prices || [],
      };
      routes.push(updatedRoute);
    }
    setStorage(STORAGE_KEYS.ROUTES, routes);

    if (isSupabaseConfigured() && supabase) {
      try {
        const isClientTempId = updatedRoute.id.startsWith('rt_');
        const { data } = await supabase.from('routes').upsert({
          ...(isClientTempId ? {} : { id: updatedRoute.id }),
          origin: updatedRoute.origin,
          destination: updatedRoute.destination,
          image_url: updatedRoute.image_url,
          is_active: updatedRoute.is_active,
          is_featured: updatedRoute.is_featured,
          display_order: updatedRoute.display_order,
        }).select().single();

        if (data && updatedRoute.prices && updatedRoute.prices.length > 0) {
          for (const p of updatedRoute.prices) {
            await supabase.from('route_prices').upsert({
              route_id: data.id,
              car_id: p.car_id,
              price: p.price,
            });
          }
        }
      } catch (err) {
        console.error('Supabase route save error:', err);
      }
    }
    return updatedRoute;
  },

  async deleteRoute(id: string): Promise<void> {
    const routes = (await this.getRoutes()).filter((r) => r.id !== id);
    setStorage(STORAGE_KEYS.ROUTES, routes);
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('routes').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase route delete error:', err);
      }
    }
  },

  // DESTINATIONS
  async getDestinations(): Promise<Destination[]> {
    let destinations: Destination[] = [];
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) destinations = data;
    }
    if (destinations.length === 0) {
      destinations = getStorage<Destination[]>(STORAGE_KEYS.DESTINATIONS, INITIAL_DESTINATIONS);
    }
    return destinations.map((d) => ({
      ...d,
      image_url: migrateLegacyImagePath(d.image_url, 'destination'),
    }));
  },

  async saveDestination(dest: Partial<Destination>): Promise<Destination> {
    const destinations = await this.getDestinations();
    let updatedDest: Destination;
    if (dest.id) {
      const index = destinations.findIndex((d) => d.id === dest.id);
      if (index !== -1) {
        const existing = destinations[index];
        const finalImg = dest.image_url !== undefined && dest.image_url !== '' ? dest.image_url : existing.image_url;
        updatedDest = {
          ...existing,
          ...dest,
          image_url: finalImg,
        } as Destination;
        destinations[index] = updatedDest;
      } else {
        updatedDest = {
          id: dest.id,
          name: dest.name || 'New Destination',
          description: dest.description || '',
          image_url: dest.image_url || DESTINATION_IMAGES.mumbai,
          is_published: dest.is_published ?? true,
          display_order: dest.display_order || destinations.length + 1,
        };
        destinations.push(updatedDest);
      }
    } else {
      updatedDest = {
        id: 'dest_' + Date.now(),
        name: dest.name || 'New Destination',
        description: dest.description || '',
        image_url: dest.image_url || DESTINATION_IMAGES.mumbai,
        is_published: dest.is_published ?? true,
        display_order: destinations.length + 1,
      };
      destinations.push(updatedDest);
    }
    setStorage(STORAGE_KEYS.DESTINATIONS, destinations);

    if (isSupabaseConfigured() && supabase) {
      try {
        const isTempId = updatedDest.id.startsWith('dest_');
        await supabase.from('destinations').upsert({
          ...(isTempId ? {} : { id: updatedDest.id }),
          name: updatedDest.name,
          description: updatedDest.description,
          image_url: updatedDest.image_url,
          is_published: updatedDest.is_published,
          display_order: updatedDest.display_order,
        });
      } catch (err) {
        console.error('Supabase destination save error:', err);
      }
    }
    return updatedDest;
  },

  async deleteDestination(id: string): Promise<void> {
    const destinations = (await this.getDestinations()).filter((d) => d.id !== id);
    setStorage(STORAGE_KEYS.DESTINATIONS, destinations);
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('destinations').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase destination delete error:', err);
      }
    }
  },

  // REVIEWS
  async getReviews(): Promise<Review[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) return data;
    }
    return getStorage<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  },

  async saveReview(review: Partial<Review>): Promise<Review> {
    const reviews = await this.getReviews();
    let updatedReview: Review;
    if (review.id) {
      const index = reviews.findIndex((r) => r.id === review.id);
      if (index !== -1) {
        const existing = reviews[index];
        const finalAvatar = review.avatar_url !== undefined ? review.avatar_url : existing.avatar_url;
        updatedReview = {
          ...existing,
          ...review,
          avatar_url: finalAvatar,
        } as Review;
        reviews[index] = updatedReview;
      } else {
        updatedReview = {
          id: review.id,
          customer_name: review.customer_name || 'Guest',
          rating: review.rating || 5,
          review_text: review.review_text || '',
          avatar_url: review.avatar_url || null,
          is_published: review.is_published ?? true,
          is_demo: review.is_demo ?? false,
          display_order: review.display_order || reviews.length + 1,
        };
        reviews.push(updatedReview);
      }
    } else {
      updatedReview = {
        id: 'rv_' + Date.now(),
        customer_name: review.customer_name || 'Guest',
        rating: review.rating || 5,
        review_text: review.review_text || '',
        avatar_url: review.avatar_url || null,
        is_published: review.is_published ?? true,
        is_demo: false,
        display_order: reviews.length + 1,
      };
      reviews.push(updatedReview);
    }
    setStorage(STORAGE_KEYS.REVIEWS, reviews);

    if (isSupabaseConfigured() && supabase) {
      try {
        const isTempId = updatedReview.id.startsWith('rv_');
        await supabase.from('reviews').upsert({
          ...(isTempId ? {} : { id: updatedReview.id }),
          customer_name: updatedReview.customer_name,
          rating: updatedReview.rating,
          review_text: updatedReview.review_text,
          avatar_url: updatedReview.avatar_url,
          is_published: updatedReview.is_published,
          is_demo: updatedReview.is_demo,
          display_order: updatedReview.display_order,
        });
      } catch (err) {
        console.error('Supabase review save error:', err);
      }
    }
    return updatedReview;
  },

  async deleteReview(id: string): Promise<void> {
    const reviews = (await this.getReviews()).filter((r) => r.id !== id);
    setStorage(STORAGE_KEYS.REVIEWS, reviews);
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('reviews').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase review delete error:', err);
      }
    }
  },

  // INQUIRIES
  async getInquiries(): Promise<Inquiry[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    }
    return getStorage<Inquiry[]>(STORAGE_KEYS.INQUIRIES, INITIAL_INQUIRIES);
  },

  async submitInquiry(input: InquiryFormInput, source: 'website' | 'phone' | 'whatsapp' = 'website'): Promise<Inquiry> {
    const newInquiry: Inquiry = {
      id: 'inq_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      customer_name: input.customer_name.trim(),
      phone: input.phone.trim(),
      pickup_location: input.pickup_location.trim(),
      destination: input.destination.trim(),
      travel_date: input.travel_date,
      travel_time: input.travel_time || 'Morning',
      car_id: input.car_id || null,
      car_name: input.car_name || 'Not specified',
      passengers: Number(input.passengers) || 1,
      trip_type: input.trip_type,
      message: input.message?.trim() || null,
      status: 'New',
      source,
      created_at: new Date().toISOString(),
    };

    const inquiries = await this.getInquiries();
    inquiries.unshift(newInquiry);
    setStorage(STORAGE_KEYS.INQUIRIES, inquiries);

    if (isSupabaseConfigured() && supabase) {
      try {
        const { id, ...inquiryPayload } = newInquiry;
        const { data, error } = await supabase
          .from('inquiries')
          .insert(inquiryPayload)
          .select()
          .single();

        if (!error && data?.id) {
          newInquiry.id = data.id;
          setStorage(STORAGE_KEYS.INQUIRIES, inquiries);
        } else if (error) {
          console.error('Supabase inquiry insert error:', error);
        }
      } catch (err) {
        console.error('Supabase inquiry insert exception:', err);
      }
    }

    return newInquiry;
  },

  async updateInquiryStatus(id: string, status: Inquiry['status'], notes?: string, agreedPrice?: number): Promise<Inquiry | null> {
    const inquiries = await this.getInquiries();
    const index = inquiries.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const previousStatus = inquiries[index].status;
    const previousNotes = inquiries[index].internal_notes;
    const previousPrice = inquiries[index].agreed_price;

    inquiries[index].status = status;
    if (notes !== undefined) inquiries[index].internal_notes = notes;
    if (agreedPrice !== undefined) inquiries[index].agreed_price = agreedPrice;
    inquiries[index].updated_at = new Date().toISOString();

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('inquiries').update({
        status,
        internal_notes: inquiries[index].internal_notes,
        agreed_price: inquiries[index].agreed_price,
        updated_at: inquiries[index].updated_at,
      }).eq('id', id);

      if (error) {
        inquiries[index].status = previousStatus;
        inquiries[index].internal_notes = previousNotes;
        inquiries[index].agreed_price = previousPrice;
        setStorage(STORAGE_KEYS.INQUIRIES, inquiries);
        throw error;
      }
    }

    setStorage(STORAGE_KEYS.INQUIRIES, inquiries);
    return inquiries[index];
  },

  async deleteInquiry(id: string): Promise<void> {
    const inquiries = (await this.getInquiries()).filter((i) => i.id !== id);
    setStorage(STORAGE_KEYS.INQUIRIES, inquiries);
    if (isSupabaseConfigured() && supabase) {
      if (!id.startsWith('inq_')) {
        await supabase.from('inquiries').delete().eq('id', id);
      }
    }
  },

  // SETTINGS
  async getSettings(): Promise<SiteSettings> {
    let settings: SiteSettings = INITIAL_SETTINGS;
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'default').single();
      if (!error && data) settings = data;
    } else {
      settings = getStorage<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    }
    if (settings.logo_url) {
      settings = {
        ...settings,
        logo_url: migrateLegacyImagePath(settings.logo_url),
      };
    }
    return settings;
  },

  async saveSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings, updated_at: new Date().toISOString() };
    setStorage(STORAGE_KEYS.SETTINGS, updated);

    if (isSupabaseConfigured() && supabase) {
      await supabase.from('site_settings').upsert(updated);
    }
    return updated;
  },

  // HOMEPAGE SECTIONS
  async getHomepageContent(): Promise<Record<string, HomepageSection>> {
    let map: Record<string, HomepageSection> = { ...INITIAL_CONTENT };
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('homepage_sections').select('*');
        if (!error && data && data.length > 0) {
          for (const s of data) {
            map[s.id] = s;
          }
        }
      } catch (err) {
        console.warn('Supabase homepage sections fetch fallback:', err);
      }
    } else {
      map = getStorage<Record<string, HomepageSection>>(STORAGE_KEYS.CONTENT, INITIAL_CONTENT);
    }

    for (const key of Object.keys(map)) {
      if (map[key].image_url) {
        map[key] = {
          ...map[key],
          image_url: migrateLegacyImagePath(map[key].image_url, key === 'hero' ? 'hero' : 'about'),
        };
      }
    }
    return map;
  },

  async saveHomepageContent(key: string, content: Partial<HomepageSection>): Promise<HomepageSection> {
    const all = await this.getHomepageContent();
    const current = all[key] || { id: key, title: '', subtitle: '' };
    const finalImg = content.image_url !== undefined && content.image_url !== '' ? content.image_url : current.image_url;
    const updated = { ...current, ...content, image_url: finalImg };
    all[key] = updated;
    setStorage(STORAGE_KEYS.CONTENT, all);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('homepage_sections').upsert(updated);
      } catch (err) {
        console.error('Supabase homepage section save error:', err);
      }
    }
    return updated;
  },

  // SUPABASE STORAGE ASSET UPLOAD
  async uploadImage(file: File): Promise<string | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const { data, error } = await supabase.storage.from('travel-assets').upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });
        if (!error && data) {
          const { data: publicData } = supabase.storage.from('travel-assets').getPublicUrl(fileName);
          return publicData.publicUrl;
        }
        if (error) {
          console.warn('Supabase storage upload error:', error);
          throw new Error(error.message || 'Supabase storage upload failed');
        }
      } catch (err: unknown) {
        console.warn('Supabase storage upload error, falling back if demo mode:', err);
        if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
          throw err;
        }
      }
    }

    // Local / Offline fallback to compressed persistent data URL (prevents LocalStorage QuotaExceededError)
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(null);
        return;
      }
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
        return;
      }
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const maxDim = 800;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || null);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        let dataUrl = canvas.toDataURL('image/webp', 0.8);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        }
        resolve(dataUrl);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      };
      img.src = objectUrl;
    });
  },

  // SAFE STORAGE CLEANUP
  async safeDeleteUnusedStorageAsset(imageUrl?: string | null): Promise<boolean> {
    if (!imageUrl || typeof imageUrl !== 'string') return false;
    // Only attempt delete if it is hosted in the managed Supabase 'travel-assets' bucket
    const isManagedStorage =
      imageUrl.includes('/travel-assets/') ||
      imageUrl.includes('travel-assets/');
    if (!isManagedStorage) return false;

    // Extract path/filename inside the travel-assets bucket
    let filename = '';
    const match = imageUrl.match(/travel-assets\/([^?#]+)/);
    if (match && match[1]) {
      filename = decodeURIComponent(match[1]);
    }
    if (!filename) return false;

    try {
      // Check if any active entity still references this image
      const [cars, destinations, routes, settings, sections] = await Promise.all([
        this.getCars(),
        this.getDestinations(),
        this.getRoutes(),
        this.getSettings(),
        this.getHomepageContent(),
      ]);

      const isInCars = cars.some(
        (c: Car) =>
          c.image_url === imageUrl ||
          c.hero_image_url === imageUrl ||
          (c.gallery_images && c.gallery_images.includes(imageUrl))
      );
      if (isInCars) return false;

      const isInDestinations = destinations.some((d: Destination) => d.image_url === imageUrl);
      if (isInDestinations) return false;

      const isInRoutes = routes.some((r: Route) => r.image_url === imageUrl);
      if (isInRoutes) return false;

      if (settings?.logo_url === imageUrl) return false;

      const isInSections = Object.values(sections).some((s: HomepageSection) => s.image_url === imageUrl);
      if (isInSections) return false;

      // Confirmed unused: delete from Supabase storage bucket
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.storage.from('travel-assets').remove([filename]);
        if (error) {
          console.warn('Storage object cleanup warning:', error);
          return false;
        }
        return true;
      }
      return false;
    } catch (cleanupErr) {
      console.warn('Failed to verify or delete unused storage object:', cleanupErr);
      return false;
    }
  },

  // REALTIME SYNCHRONIZATION
  subscribe(callback: (event: RealtimeEvent) => void): () => void {
    return RealtimeManager.getInstance().subscribe(callback);
  },

  getRealtimeStatus(): string {
    return RealtimeManager.getInstance().getStatus();
  },
};

export type RealtimeEvent = {
  type: string;
  key: string;
  table?: string;
  payload?: RealtimePostgresChangesPayload<Record<string, unknown>> | Record<string, unknown> | null;
  timestamp?: number;
};

// Singleton Realtime Synchronization Manager
// Prevents duplicate websocket channels, coordinates tab events, handles auto-reconnect
class RealtimeManager {
  private static instance: RealtimeManager;
  private subscribers: Set<(event: RealtimeEvent) => void> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private supabaseChannel: RealtimeChannel | null = null;
  private isInitialized = false;
  private status: 'connected' | 'connecting' | 'disconnected' | 'demo' = 'demo';
  private lastHiddenTime = 0;

  private constructor() {}

  public static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  public getStatus(): string {
    return this.status;
  }

  public subscribe(callback: (event: RealtimeEvent) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    this.subscribers.add(callback);

    if (!this.isInitialized) {
      this.init();
    }

    return () => {
      this.subscribers.delete(callback);
      if (this.subscribers.size === 0) {
        this.teardown();
      }
    };
  }

  private notify(event: RealtimeEvent) {
    this.subscribers.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.error('Realtime callback error:', err);
      }
    });
  }

  private init() {
    this.isInitialized = true;

    // 1. Cross-tab BroadcastChannel
    try {
      this.broadcastChannel = new BroadcastChannel('rr_sync_channel');
      this.broadcastChannel.onmessage = (e: MessageEvent) => {
        if (e.data && e.data.type) {
          this.notify({ ...e.data, timestamp: Date.now() });
        }
      };
    } catch {
      // BroadcastChannel unsupported fallback
    }

    // 2. Same-window custom event
    window.addEventListener('rr_store_change', this.handleLocalEvent);

    // 3. Tab visibility listener (re-sync on tab refocus if inactive)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // 4. Online/offline connection resilience
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // 5. Supabase Realtime channel across all entities
    this.initSupabaseRealtime();
  }

  private handleLocalEvent = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    this.notify({
      type: 'SYNC_UPDATE',
      key: detail?.key || 'all',
      timestamp: Date.now(),
    });
  };

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.lastHiddenTime = Date.now();
    } else {
      // If inactive for > 5s, trigger silent resync to guarantee freshness
      if (Date.now() - this.lastHiddenTime > 5000) {
        this.notify({
          type: 'VISIBILITY_RESYNC',
          key: 'all',
          timestamp: Date.now(),
        });
      }
    }
  };

  private handleOnline = () => {
    this.status = isSupabaseConfigured() ? 'connecting' : 'demo';
    this.initSupabaseRealtime();
    this.notify({
      type: 'NETWORK_RECONNECTED',
      key: 'all',
      timestamp: Date.now(),
    });
  };

  private handleOffline = () => {
    this.status = 'disconnected';
  };

  private initSupabaseRealtime() {
    if (!isSupabaseConfigured() || !supabase) {
      this.status = 'demo';
      return;
    }

    if (this.supabaseChannel) {
      try {
        supabase.removeChannel(this.supabaseChannel);
      } catch {
        // Safe ignore
      }
      this.supabaseChannel = null;
    }

    this.status = 'connecting';

    try {
      const channel = supabase.channel('royalrides_realtime_sync');

      // Public table synchronization
      const tables: Array<{ table: string; key: string }> = [
        { table: 'cars', key: STORAGE_KEYS.CARS },
        { table: 'routes', key: STORAGE_KEYS.ROUTES },
        { table: 'route_prices', key: STORAGE_KEYS.ROUTES },
        { table: 'destinations', key: STORAGE_KEYS.DESTINATIONS },
        { table: 'reviews', key: STORAGE_KEYS.REVIEWS },
        { table: 'homepage_sections', key: STORAGE_KEYS.CONTENT },
        { table: 'site_settings', key: STORAGE_KEYS.SETTINGS },
      ];

      tables.forEach(({ table, key }) => {
        channel.on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
            this.notify({
              type: 'SUPABASE_REALTIME',
              key,
              table,
              payload,
              timestamp: Date.now(),
            });
          }
        );
      });

      // Inquiries table (Admin context - protected by Supabase RLS)
      const isAdminContext =
        typeof window !== 'undefined' &&
        (window.location.pathname.startsWith('/admin') ||
          !!localStorage.getItem('rr_admin_token'));

      if (isAdminContext) {
        channel.on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'inquiries' },
          (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
            this.notify({
              type: 'SUPABASE_REALTIME',
              key: STORAGE_KEYS.INQUIRIES,
              table: 'inquiries',
              payload,
              timestamp: Date.now(),
            });
          }
        );
      }

      channel.subscribe((status: `${REALTIME_SUBSCRIBE_STATES}`) => {
        if (status === 'SUBSCRIBED') {
          this.status = 'connected';
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          this.status = 'disconnected';
        }
      });

      this.supabaseChannel = channel;
    } catch (err) {
      console.error('Failed to initialize Supabase Realtime channel:', err);
      this.status = 'disconnected';
    }
  }

  private teardown() {
    this.isInitialized = false;

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {
        // Safe ignore
      }
      this.broadcastChannel = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('rr_store_change', this.handleLocalEvent);
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }

    if (this.supabaseChannel && supabase) {
      try {
        supabase.removeChannel(this.supabaseChannel);
      } catch {
        // Safe ignore
      }
      this.supabaseChannel = null;
    }

    this.status = isSupabaseConfigured() ? 'disconnected' : 'demo';
  }
}
