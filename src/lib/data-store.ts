'use client';

import { Car, Route, Destination, Review, Inquiry, SiteSettings, HomepageSection, InquiryFormInput } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase/client';

// Initial authoritative seed data
const INITIAL_CARS: Car[] = [
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Ertiga',
    car_type: 'MPV',
    seating_capacity: '6+1 Seating',
    image_url: '/images/cars/ertiga-transparent.png',
    hero_image_url: '/images/cars/ertiga-transparent.png',
    is_active: true,
    is_hero_featured: true,
    display_order: 1,
  },
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Innova',
    car_type: 'MPV',
    seating_capacity: '7+1 Seating',
    image_url: '/images/cars/innova-transparent.png',
    hero_image_url: '/images/cars/innova-transparent.png',
    is_active: true,
    is_hero_featured: true,
    display_order: 2,
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Swift Dzire',
    car_type: 'Sedan',
    seating_capacity: '4+1 Seating',
    image_url: '/images/cars/swift-dzire-transparent.png',
    hero_image_url: '/images/cars/swift-dzire-transparent.png',
    is_active: true,
    is_hero_featured: true,
    display_order: 3,
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Urbania Traveller',
    car_type: 'Luxury Van',
    seating_capacity: '12+1 Seating',
    image_url: '/images/cars/urbania-transparent.png',
    hero_image_url: '/images/cars/urbania-transparent.png',
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
    image_url: '/images/airport-transfer.jpg',
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
    image_url: '/images/destinations/mumbai.jpg',
    is_published: true,
    display_order: 1,
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    name: 'Lonavala',
    description: 'Scenic misty Western Ghats, valleys & waterfalls.',
    image_url: '/images/destinations/lonavala.jpg',
    is_published: true,
    display_order: 2,
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    name: 'Nashik',
    description: 'Wine capital and sacred pilgrimage temples along Godavari.',
    image_url: '/images/destinations/nashik.jpg',
    is_published: true,
    display_order: 3,
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    name: 'Statue of Unity',
    description: 'World’s tallest statue overlooking the serene Narmada river.',
    image_url: '/images/destinations/statue-of-unity.jpg',
    is_published: true,
    display_order: 4,
  },
  {
    id: 'd5555555-5555-5555-5555-555555555555',
    name: 'Somnath',
    description: 'Magnificent oceanfront Jyotirlinga temple shrine.',
    image_url: '/images/destinations/somnath.jpg',
    is_published: true,
    display_order: 5,
  },
  {
    id: 'd6666666-6666-6666-6666-666666666666',
    name: 'Diu',
    description: 'Sun-kissed beaches, golden sand, and historic sea fort.',
    image_url: '/images/destinations/diu.jpg',
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
    image_url: '/images/hero-bg.jpg',
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
  } catch (err) {
    console.error('Storage write error:', err);
  }
}

export const DataStore = {
  // CARS
  async getCars(): Promise<Car[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) return data;
    }
    return getStorage<Car[]>(STORAGE_KEYS.CARS, INITIAL_CARS);
  },

  async saveCar(car: Partial<Car>): Promise<Car> {
    const cars = await this.getCars();
    let updatedCar: Car;
    if (car.id) {
      const index = cars.findIndex((c) => c.id === car.id);
      if (index !== -1) {
        updatedCar = { ...cars[index], ...car } as Car;
        cars[index] = updatedCar;
      } else {
        updatedCar = {
          id: car.id,
          name: car.name || 'New Car',
          car_type: car.car_type || 'MPV',
          seating_capacity: car.seating_capacity || '7+1 Seating',
          image_url: car.image_url || '/images/cars/innova.jpg',
          hero_image_url: car.hero_image_url || car.image_url || '/images/cars/innova-transparent.png',
          is_active: car.is_active ?? true,
          is_hero_featured: car.is_hero_featured ?? true,
          display_order: car.display_order || cars.length + 1,
        };
        cars.push(updatedCar);
      }
    } else {
      updatedCar = {
        id: 'car_' + Date.now(),
        name: car.name || 'New Car',
        car_type: car.car_type || 'MPV',
        seating_capacity: car.seating_capacity || '7+1 Seating',
        image_url: car.image_url || '/images/cars/innova.jpg',
        hero_image_url: car.hero_image_url || car.image_url || '/images/cars/innova-transparent.png',
        is_active: car.is_active ?? true,
        is_hero_featured: car.is_hero_featured ?? true,
        display_order: cars.length + 1,
      };
      cars.push(updatedCar);
    }
    setStorage(STORAGE_KEYS.CARS, cars);

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('cars').upsert(updatedCar);
      if (error) {
        // Fallback retry if hero_image_url column is not yet present in Supabase
        const { hero_image_url, ...fallbackCar } = updatedCar;
        const { error: fallbackError } = await supabase.from('cars').upsert(fallbackCar);
        if (fallbackError) {
          throw new Error(fallbackError.message || 'Failed to save car to Supabase');
        }
      }
    }
    return updatedCar;
  },

  async deleteCar(id: string): Promise<void> {
    const cars = (await this.getCars()).filter((c) => c.id !== id);
    setStorage(STORAGE_KEYS.CARS, cars);
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('cars').delete().eq('id', id);
    }
  },

  // ROUTES
  async getRoutes(): Promise<Route[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('routes')
        .select('*, prices:route_prices(*)')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) return data;
    }
    return getStorage<Route[]>(STORAGE_KEYS.ROUTES, INITIAL_ROUTES);
  },

  async saveRoute(route: Partial<Route>): Promise<Route> {
    const routes = await this.getRoutes();
    let updatedRoute: Route;
    if (route.id) {
      const index = routes.findIndex((r) => r.id === route.id);
      if (index !== -1) {
        updatedRoute = { ...routes[index], ...route } as Route;
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
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) return data;
    }
    return getStorage<Destination[]>(STORAGE_KEYS.DESTINATIONS, INITIAL_DESTINATIONS);
  },

  async saveDestination(dest: Partial<Destination>): Promise<Destination> {
    const destinations = await this.getDestinations();
    let updatedDest: Destination;
    if (dest.id) {
      const index = destinations.findIndex((d) => d.id === dest.id);
      if (index !== -1) {
        updatedDest = { ...destinations[index], ...dest } as Destination;
        destinations[index] = updatedDest;
      } else {
        updatedDest = {
          id: dest.id,
          name: dest.name || 'New Destination',
          description: dest.description || '',
          image_url: dest.image_url || '/images/destinations/mumbai.jpg',
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
        image_url: dest.image_url || '/images/destinations/mumbai.jpg',
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
        updatedReview = { ...reviews[index], ...review } as Review;
        reviews[index] = updatedReview;
      } else {
        updatedReview = {
          id: review.id,
          customer_name: review.customer_name || 'Guest',
          rating: review.rating || 5,
          review_text: review.review_text || '',
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
      await supabase.from('inquiries').insert(newInquiry);
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
      await supabase.from('inquiries').delete().eq('id', id);
    }
  },

  // SETTINGS
  async getSettings(): Promise<SiteSettings> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'default').single();
      if (!error && data) return data;
    }
    return getStorage<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
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
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('homepage_sections').select('*');
        if (!error && data && data.length > 0) {
          const map: Record<string, HomepageSection> = { ...INITIAL_CONTENT };
          for (const s of data) {
            map[s.id] = s;
          }
          return map;
        }
      } catch (err) {
        console.warn('Supabase homepage sections fetch fallback:', err);
      }
    }
    return getStorage<Record<string, HomepageSection>>(STORAGE_KEYS.CONTENT, INITIAL_CONTENT);
  },

  async saveHomepageContent(key: string, content: Partial<HomepageSection>): Promise<HomepageSection> {
    const all = await this.getHomepageContent();
    const current = all[key] || { id: key, title: '', subtitle: '' };
    const updated = { ...current, ...content };
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
      } catch (err: any) {
        console.warn('Supabase storage upload error, falling back if demo mode:', err);
        if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
          throw err;
        }
      }
    }

    // Local / Offline fallback to persistent data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve((e.target?.result as string) || null);
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  },

  // REALTIME SYNCHRONIZATION
  subscribe(callback: (event: { type: string; key: string; table?: string; payload?: any }) => void): () => void {
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
  payload?: any;
  timestamp?: number;
};

// Singleton Realtime Synchronization Manager
// Prevents duplicate websocket channels, coordinates tab events, handles auto-reconnect
class RealtimeManager {
  private static instance: RealtimeManager;
  private subscribers: Set<(event: RealtimeEvent) => void> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private supabaseChannel: any = null;
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
          (payload) => {
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
          (payload) => {
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

      channel.subscribe((status) => {
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
