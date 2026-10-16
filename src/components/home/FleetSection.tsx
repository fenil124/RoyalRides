'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Image from '@/components/common/Image';
import {
  Users,
  Fuel,
  Settings as TransmissionIcon,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  MessageCircle,
  Star,
} from 'lucide-react';
import { Car, SiteSettings } from '@/types';

interface FleetSectionProps {
  cars: Car[];
  onSelectCar?: (car: Car) => void;
  settings?: SiteSettings;
}

const CATEGORY_TABS = [
  'All Vehicles',
  'MPV',
  'Sedan',
  'Luxury',
  'SUV',
  'Tempo Traveller',
];

export function FleetSection({ cars, onSelectCar, settings }: FleetSectionProps) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All Vehicles');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Active published vehicles only
  const activeCars = cars.filter((c) => c.is_active);

  // Filter cars based on selected category tab
  const filteredCars = activeCars.filter((car) => {
    if (selectedCategory === 'All Vehicles') return true;
    const cat = (car.category || car.car_type || '').toLowerCase();
    const target = selectedCategory.toLowerCase();

    if (target === 'tempo traveller') {
      return cat.includes('tempo') || cat.includes('traveller') || cat.includes('van');
    }
    if (target === 'luxury') {
      return cat.includes('luxury') || (car.badge && car.badge.toLowerCase().includes('luxury'));
    }
    return cat.includes(target);
  });

  // Calculate scroll button states & active dot index
  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Calculate approximate index based on card width + gap
    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 24
      : 360;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(0, index), Math.max(0, filteredCars.length - 1)));
  }, [filteredCars.length]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  // When changing category, reset scroll to start
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
    setActiveIndex(0);
  }, [selectedCategory]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 24
      : 360;
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleScrollToCard = (index: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 24
      : 360;
    el.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
    setActiveIndex(index);
  };

  const handleOpenDetails = (car: Car) => {
    const targetSlug = car.slug || car.id;
    navigate(`/fleet/${targetSlug}`);
  };

  const handleOpenWhatsApp = (e: React.MouseEvent, car: Car) => {
    e.stopPropagation();
    const rawPhone = settings?.whatsapp || '+91 98765 43210';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '') || '919876543210';
    const message = encodeURIComponent(
      `Hello RoyalRides Travels, I am inquiring about the ${car.name}. Please share booking and tariff details.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      id="fleet"
      className="py-16 sm:py-24 bg-white border-b border-[#E2E8F0] scroll-mt-20 sm:scroll-mt-24 select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center gap-2 text-xs font-bold text-[#F5B936] uppercase tracking-[0.2em] mb-2.5">
            <span className="w-5 h-[1.5px] bg-[#F5B936]" />
            <span>OUR FLEET</span>
            <span className="w-5 h-[1.5px] bg-[#F5B936]" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#081A33] tracking-tight">
            Choose Your <span className="text-[#F5B936]">Perfect Ride</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#64748B] leading-relaxed">
            Explore our chauffeur-driven vehicles for comfortable city journeys, airport transfers, and outstation travel.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 sm:mb-12 no-scrollbar px-1">
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedCategory(tab)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#081A33] text-white shadow-md shadow-[#081A33]/20 scale-102'
                    : 'bg-white text-slate-700 hover:text-[#081A33] hover:bg-slate-50 border border-slate-200/80 shadow-2xs'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Carousel Container with Floating Left / Right Buttons */}
        <div className="relative group">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll fleet carousel left"
            className={`hidden md:flex absolute -left-5 lg:-left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white border border-slate-200/90 shadow-xl items-center justify-center transition-all duration-200 cursor-pointer ${
              canScrollLeft
                ? 'text-[#081A33] hover:bg-slate-50 hover:scale-110 active:scale-95'
                : 'opacity-30 cursor-not-allowed text-slate-300'
            }`}
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll fleet carousel right"
            className={`hidden md:flex absolute -right-5 lg:-right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white border border-slate-200/90 shadow-xl items-center justify-center transition-all duration-200 cursor-pointer ${
              canScrollRight
                ? 'text-[#081A33] hover:bg-slate-50 hover:scale-110 active:scale-95'
                : 'opacity-30 cursor-not-allowed text-slate-300'
            }`}
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Horizontal Sliding Carousel Track */}
          <div
            ref={scrollContainerRef}
            tabIndex={0}
            aria-label="RoyalRides Fleet Carousel"
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') handleScroll('left');
              if (e.key === 'ArrowRight') handleScroll('right');
            }}
            className="flex items-stretch gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 px-2 no-scrollbar outline-none focus:ring-1 focus:ring-[#F5B936]/40 rounded-3xl"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredCars.map((car) => {
              const outstationPrice = car.outstation_price_per_km ?? 15;
              const dailyPrice = car.daily_package_price ?? 3500;
              const manufacturer = car.manufacturer || (car.name.split(' ')[0] || 'ROYALRIDES');
              const displayBadge = car.badge || 'VERIFIED FLEET';

              return (
                <div
                  key={car.id || car.slug}
                  onClick={() => handleOpenDetails(car)}
                  className="snap-start shrink-0 w-[84vw] sm:w-[350px] md:w-[370px] lg:w-[375px] bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:border-[#F5B936]/60 transition-all duration-300 flex flex-col justify-between cursor-pointer group/card relative"
                >
                  <div>
                    {/* Top Row: Badge & Rating */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      {displayBadge ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-[#F5B936]/15 text-[#B87A04] border border-[#F5B936]/30">
                          {displayBadge}
                        </span>
                      ) : (
                        <div />
                      )}

                      {car.rating ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-[#081A33]">
                          <Star className="w-3.5 h-3.5 fill-[#F5B936] text-[#F5B936]" />
                          <span>{car.rating}</span>
                          {car.review_count && (
                            <span className="text-[11px] font-normal text-slate-400">
                              ({car.review_count})
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>

                    {/* Primary Vehicle Image */}
                    <div className="relative w-full h-44 sm:h-48 mb-4 flex items-center justify-center overflow-hidden">
                      <Image
                        src={car.image_url}
                        alt={car.name}
                        fill
                        className="object-contain p-2 group-hover/card:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 380px"
                      />
                    </div>

                    {/* Vehicle Identity */}
                    <div className="mb-4">
                      <span className="block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                        {manufacturer}
                      </span>
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#081A33] group-hover/card:text-[#F5B936] transition-colors leading-snug">
                        {car.name}
                      </h3>
                    </div>

                    {/* Key Technical Specs Row */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-slate-600 mb-5">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{car.seating_capacity || '7 Seats'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold justify-center">
                        <Fuel className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{car.fuel_type || 'Diesel'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold justify-end">
                        <TransmissionIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{car.transmission || 'Automatic'}</span>
                      </div>
                    </div>

                    {/* Pricing Cards Row */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      {/* Outstation Tariff */}
                      <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg sm:text-xl font-extrabold text-[#081A33]">
                            ₹{outstationPrice}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">/km</span>
                        </div>
                        <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                          Outstation Tariff
                        </span>
                      </div>

                      {/* City Daily Package */}
                      <div className="p-3 rounded-2xl bg-[#FFF9EE] border border-[#F5B936]/25">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg sm:text-xl font-extrabold text-[#081A33]">
                            ₹{dailyPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">/day</span>
                        </div>
                        <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                          Daily Package
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Buttons Row */}
                  <div className="pt-2 flex items-center gap-2">
                    {/* Quick view button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetails(car);
                      }}
                      title="Quick View Vehicle Details"
                      aria-label={`View details for ${car.name}`}
                      className="w-11 h-11 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-[#081A33] flex items-center justify-center shrink-0 transition-colors shadow-2xs hover:border-slate-300 cursor-pointer"
                    >
                      <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
                    </button>

                    {/* WhatsApp Chat Button */}
                    <button
                      type="button"
                      onClick={(e) => handleOpenWhatsApp(e, car)}
                      title="Chat on WhatsApp"
                      aria-label={`Inquire about ${car.name} on WhatsApp`}
                      className="px-3.5 h-11 rounded-2xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 border border-[#25D366]/30 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <MessageCircle className="w-4 h-4 fill-[#25D366] text-[#25D366]" />
                      <span>Chat</span>
                    </button>

                    {/* Primary View Details Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetails(car);
                      }}
                      className="flex-1 h-11 rounded-2xl bg-[#081A33] hover:bg-[#122D52] text-white font-extrabold text-xs flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Pagination Dots Indicator */}
        {filteredCars.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {filteredCars.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleScrollToCard(i)}
                aria-label={`Go to vehicle slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  i === activeIndex
                    ? 'w-8 h-2 bg-[#F5B936]'
                    : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
