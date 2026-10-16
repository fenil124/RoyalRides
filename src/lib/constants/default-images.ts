/**
 * Persistent Default Image Assets for RoyalRides Travels
 *
 * Provides persistent remote cloud URLs so the website does not depend on
 * any local content-image folder. All images can be updated by administrators
 * via the Admin Panel using either an Image URL or File Upload.
 */

export const DEFAULT_HERO_BG =
  'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=1600&q=80';

export const DEFAULT_AIRPORT_TRANSFER =
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80';

export const DEFAULT_ABOUT_IMG =
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80';

export const DESTINATION_IMAGES: Record<string, string> = {
  mumbai:
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
  lonavala:
    'https://images.unsplash.com/photo-1626014903708-36c64188b0a7?auto=format&fit=crop&w=800&q=80',
  nashik:
    'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80',
  'statue-of-unity':
    'https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?auto=format&fit=crop&w=800&q=80',
  somnath:
    'https://images.unsplash.com/photo-1596405344148-2d0df33556f0?auto=format&fit=crop&w=800&q=80',
  diu:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
};

export interface VehicleImageAsset {
  primary: string;
  hero: string;
  transparent: string;
  gallery: string[];
}

export const VEHICLE_IMAGES: Record<string, VehicleImageAsset> = {
  innova: {
    primary:
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    hero:
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    transparent:
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80',
    ],
  },
  ertiga: {
    primary:
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    hero:
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    transparent:
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    ],
  },
  'swift-dzire': {
    primary:
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
    hero:
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
    transparent:
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
    ],
  },
  urbania: {
    primary:
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
    hero:
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
    transparent:
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
    ],
  },
  fortuner: {
    primary:
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    hero:
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    transparent:
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    ],
  },
};

/**
 * Migration helper: converts any legacy local image path into a persistent remote URL.
 * If the path is already an external URL or data URL, it returns it unchanged.
 */
export function migrateLegacyImagePath(path?: string | null, category?: string): string {
  if (!path) {
    if (category === 'destination') return DESTINATION_IMAGES.mumbai;
    if (category === 'car') return VEHICLE_IMAGES.innova.primary;
    if (category === 'hero') return DEFAULT_HERO_BG;
    if (category === 'about') return DEFAULT_ABOUT_IMG;
    return DEFAULT_AIRPORT_TRANSFER;
  }

  // Already a remote HTTP/HTTPS or data URL
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  const clean = path.toLowerCase();

  // Hero background
  if (clean.includes('hero-bg') || clean.includes('hero')) {
    return DEFAULT_HERO_BG;
  }

  // Airport transfer & routes
  if (clean.includes('airport') || clean.includes('transfer')) {
    return DEFAULT_AIRPORT_TRANSFER;
  }

  // Destinations
  if (clean.includes('mumbai')) return DESTINATION_IMAGES.mumbai;
  if (clean.includes('lonavala')) return DESTINATION_IMAGES.lonavala;
  if (clean.includes('nashik')) return DESTINATION_IMAGES.nashik;
  if (clean.includes('statue') || clean.includes('unity')) return DESTINATION_IMAGES['statue-of-unity'];
  if (clean.includes('somnath')) return DESTINATION_IMAGES.somnath;
  if (clean.includes('diu')) return DESTINATION_IMAGES.diu;

  // Vehicles
  if (clean.includes('innova')) return VEHICLE_IMAGES.innova.primary;
  if (clean.includes('ertiga')) return VEHICLE_IMAGES.ertiga.primary;
  if (clean.includes('dzire') || clean.includes('swift')) return VEHICLE_IMAGES['swift-dzire'].primary;
  if (clean.includes('urbania') || clean.includes('traveller')) return VEHICLE_IMAGES.urbania.primary;
  if (clean.includes('fortuner')) return VEHICLE_IMAGES.fortuner.primary;

  // Category-specific fallback if path cannot be matched
  if (category === 'destination') return DESTINATION_IMAGES.mumbai;
  if (category === 'car') return VEHICLE_IMAGES.innova.primary;
  if (category === 'hero') return DEFAULT_HERO_BG;
  if (category === 'about') return DEFAULT_ABOUT_IMG;

  // Default fallback
  return DEFAULT_AIRPORT_TRANSFER;
}
