'use client';

import Image from '@/components/common/Image';
import { motion, type Variants } from 'framer-motion';
import { Users, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { Car } from '@/types';

interface FleetSectionProps {
  cars: Car[];
  onSelectCar: (car: Car) => void;
}

export function FleetSection({ cars, onSelectCar }: FleetSectionProps) {
  // Load ALL active vehicles from the existing database/store
  const activeCars = cars.filter((c) => c.is_active);

  // Canonical fallback if no cars are active in database
  const canonicalFallback: Car[] = [
    {
      id: 'c2222222-2222-2222-2222-222222222222',
      name: 'Ertiga',
      image_url: '/images/cars/ertiga-transparent.png',
      car_type: 'MPV',
      seating_capacity: '6+1 Seating',
      is_active: true,
      is_hero_featured: true,
      display_order: 1,
    },
    {
      id: 'c1111111-1111-1111-1111-111111111111',
      name: 'Innova',
      image_url: '/images/cars/innova-transparent.png',
      car_type: 'MPV',
      seating_capacity: '7+1 Seating',
      is_active: true,
      is_hero_featured: true,
      display_order: 2,
    },
    {
      id: 'c3333333-3333-3333-3333-333333333333',
      name: 'Swift Dzire',
      image_url: '/images/cars/swift-dzire-transparent.png',
      car_type: 'Sedan',
      seating_capacity: '4+1 Seating',
      is_active: true,
      is_hero_featured: true,
      display_order: 3,
    },
    {
      id: 'c4444444-4444-4444-4444-444444444444',
      name: 'Urbania Traveller',
      image_url: '/images/cars/urbania-transparent.png',
      car_type: 'Luxury Van',
      seating_capacity: '12+1 Seating',
      is_active: true,
      is_hero_featured: true,
      display_order: 4,
    },
  ];

  // Helper to ensure transparent cutout is prioritized over legacy jpeg
  const getCarImageUrl = (car: { name: string; image_url: string }) => {
    if (car.image_url?.includes('.jpg')) {
      const lower = car.name.toLowerCase();
      if (lower.includes('ertiga')) return '/images/cars/ertiga-transparent.png';
      if (lower.includes('innova')) return '/images/cars/innova-transparent.png';
      if (lower.includes('dzire') || lower.includes('swift')) return '/images/cars/swift-dzire-transparent.png';
      if (lower.includes('urbania')) return '/images/cars/urbania-transparent.png';
    }
    return car.image_url || '/images/cars/innova-transparent.png';
  };

  const displayCars = (activeCars.length > 0 ? activeCars : canonicalFallback).map((c) => ({
    ...c,
    image_url: getCarImageUrl(c),
  }));

  // Dynamic grid column balancing
  const getGridCols = (count: number) => {
    if (count === 1) return 'grid-cols-1 max-w-md mx-auto';
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto';
    if (count === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    if (count === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    if (count === 5) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5';
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section
      id="fleet"
      className="py-14 sm:py-20 bg-white border-b border-[#E2E8F0] scroll-mt-20 sm:scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mb-10 sm:mb-12"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5B936] uppercase tracking-[0.2em] mb-2">
            <span className="w-5 h-[1.5px] bg-[#F5B936]" />
            <span>OUR FLEET</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#081A33] tracking-tight">
            Choose Your Perfect Ride
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#64748B] leading-relaxed">
            Explore our chauffeur-driven vehicles for comfortable city journeys, airport transfers, and outstation travel.
          </p>
        </motion.div>

        {/* Responsive Grid with Staggered Entrance Animation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={`grid gap-6 ${getGridCols(displayCars.length)}`}
        >
          {displayCars.map((car) => (
            <motion.div
              key={car.id || car.name}
              variants={cardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={() => onSelectCar(car as Car)}
              className="group bg-[#F5F8FC] rounded-2xl p-5 border border-[#E2E8F0] hover:border-[#F5B936]/60 hover:shadow-xl hover:shadow-[#081A33]/5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Image Container with Consistent Ratio & No Stretched Vehicles */}
              <div className="relative w-full h-40 sm:h-44 mb-4 rounded-xl flex items-center justify-center overflow-hidden">
                <Image
                  src={car.image_url}
                  alt={car.name}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>

              {/* Vehicle Information */}
              <div className="text-center pt-1 w-full flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#081A33] group-hover:text-[#F5B936] transition-colors">
                    {car.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mt-1 text-xs text-[#64748B] font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#081A33]" />
                      <span>{car.seating_capacity}</span>
                    </span>
                    <span>&bull;</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[#081A33] text-[10px] font-bold">
                      {car.car_type}
                    </span>
                  </div>
                </div>

                {/* Enquire Now Action */}
                <div className="mt-5 pt-3 border-t border-slate-200/60">
                  <span className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-white group-hover:bg-[#F5B936] text-[#081A33] text-xs font-extrabold border border-slate-200 group-hover:border-[#F5B936] shadow-2xs group-hover:shadow-md transition-all duration-200">
                    <span>Enquire Now</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
