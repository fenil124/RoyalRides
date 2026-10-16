export type CarType = 'MPV' | 'Sedan' | 'Luxury Van' | 'SUV' | 'Luxury' | 'Tempo Traveller';

export interface Car {
  id: string;
  name: string;
  slug?: string;
  manufacturer?: string;
  model?: string;
  car_type: string;
  category?: string; // MPV, Sedan, Luxury, SUV, Tempo Traveller
  seating_capacity: string;
  image_url: string;
  hero_image_url?: string;
  gallery_images?: string[];
  badge?: string; // e.g. "MOST POPULAR", "FAMILY FAVORITE", "MOST ECONOMICAL", "PREMIUM VAN"
  rating?: number;
  review_count?: string | number;
  completed_tours?: string;
  tagline?: string;
  short_description?: string;
  description?: string;
  highlights?: string[];
  key_features?: string[];
  amenities?: string[];
  
  // Pricing
  outstation_price_per_km?: number | null;
  daily_package_price?: number | null;
  min_km_per_day?: string;
  package_hours?: string;
  package_included_km?: string;
  driver_allowance?: number | null;
  extra_km_charge?: number | null;
  extra_hour_charge?: number | null;

  // Technical specifications & telemetry
  fuel_type?: string;
  transmission?: string;
  engine?: string;
  horsepower?: string;
  max_speed?: string;
  driver_option?: string;
  luggage_capacity?: string;

  // SEO & metadata
  meta_title?: string;
  meta_description?: string;

  is_active: boolean;
  is_hero_featured: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface RoutePrice {
  id: string;
  route_id: string;
  car_id: string;
  price: number | null; // null means "Get a Quote"
  car?: Car;
}

export interface Route {
  id: string;
  origin: string;
  destination: string;
  image_url?: string | null;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  prices?: RoutePrice[];
  created_at?: string;
  updated_at?: string;
}

export interface Destination {
  id: string;
  name: string;
  description?: string | null;
  image_url: string;
  is_published: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  avatar_url?: string | null;
  is_published: boolean;
  is_demo: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export type InquiryStatus =
  | 'New'
  | 'Contacted'
  | 'Quotation Given'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled';

export type InquirySource = 'website' | 'phone' | 'whatsapp';

export interface Inquiry {
  id: string;
  customer_name: string;
  phone: string;
  pickup_location: string;
  destination: string;
  travel_date: string;
  travel_time?: string;
  car_name?: string;
  car_id?: string | null;
  passengers: number;
  trip_type: 'one-way' | 'round-trip';
  message?: string | null;
  status: InquiryStatus;
  internal_notes?: string | null;
  agreed_price?: number | null;
  source: InquirySource;
  created_at: string;
  updated_at?: string;
}

export interface SiteSettings {
  id: string;
  agency_name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  logo_url?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  cta_text: string;
  created_at?: string;
  updated_at?: string;
}

export interface HomepageSection {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  body?: string;
  image_url?: string | null;
}

export interface InquiryFormInput {
  customer_name: string;
  phone: string;
  pickup_location: string;
  destination: string;
  travel_date: string;
  travel_time?: string;
  car_id?: string;
  car_name?: string;
  passengers: number;
  trip_type: 'one-way' | 'round-trip';
  message?: string;
}
