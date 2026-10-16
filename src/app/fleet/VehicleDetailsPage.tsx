'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Image from '@/components/common/Image';
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowUpRight,
  MessageCircle,
  Phone,
  Check,
  Star,
  Sparkles,
  Gauge,
  Zap,
  Users,
  Settings as CogIcon,
  ShieldCheck,
  Fuel,
  Briefcase,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { InquiryModal } from '@/components/common/InquiryModal';
import { FloatingContactWidget } from '@/components/common/FloatingContactWidget';
import { DataStore } from '@/lib/data-store';
import { Car, SiteSettings, InquiryFormInput } from '@/types';

export default function VehicleDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [car, setCar] = useState<Car | null>(null);
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [settings, setSettings] = useState<SiteSettings | undefined>();
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Booking modal state
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [prefilledInquiry, setPrefilledInquiry] = useState<Partial<InquiryFormInput>>({});

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveImageIndex(0);
  }, [slug]);

  const loadData = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const [carsData, settingsData] = await Promise.all([
        DataStore.getCars(),
        DataStore.getSettings(),
      ]);

      setAllCars(carsData);
      setSettings(settingsData);

      const cleanSlug = slug.toLowerCase().trim();
      const matchedCar = carsData.find(
        (c) =>
          (c.slug && c.slug.toLowerCase() === cleanSlug) ||
          c.id === cleanSlug ||
          c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanSlug ||
          c.name.toLowerCase() === cleanSlug
      );

      setCar(matchedCar || null);
    } catch (err) {
      console.error('Error loading vehicle details:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
    const unsubscribe = DataStore.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-12 h-12 rounded-full border-4 border-[#F5B936] border-t-transparent animate-spin mb-4" />
          <p className="text-slate-600 font-bold text-sm tracking-wide">
            Loading Vehicle Details...
          </p>
        </div>
        <Footer settings={settings} />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 font-black text-2xl">
            !
          </div>
          <h1 className="text-2xl font-black text-[#081A33] mb-2">Vehicle Not Found</h1>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            The vehicle model you requested could not be located in our fleet registry or has been unpublished.
          </p>
          <Link
            to="/#fleet"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#081A33] hover:bg-[#122D52] text-white text-xs font-extrabold shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Fleet Collection</span>
          </Link>
        </div>
        <Footer settings={settings} />
      </div>
    );
  }

  // Gallery images with fallback
  const galleryImages =
    car.gallery_images && car.gallery_images.length > 0
      ? car.gallery_images
      : [car.image_url, car.hero_image_url || car.image_url].filter(Boolean);

  const currentImage = galleryImages[activeImageIndex] || car.image_url;

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  // Pricing details
  const outstationPrice = car.outstation_price_per_km ?? 15;
  const dailyPrice = car.daily_package_price ?? 3500;
  const minKms = car.min_km_per_day || 'Min. 250-300 kms/day';
  const packageHours = car.package_hours || '8 Hours';
  const packageIncludedKm = car.package_included_km || '80 km Included';

  // Contact actions
  const rawPhone = settings?.phone || '+91 98765 43210';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const rawWhatsapp = settings?.whatsapp || '+91 98765 43210';
  const cleanWhatsapp = rawWhatsapp.replace(/[^0-9]/g, '') || '919876543210';
  const whatsappMessage = encodeURIComponent(
    `Hello RoyalRides Travels, I am inquiring about availability and booking for the ${car.name}.`
  );
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${whatsappMessage}`;

  const handleOpenBookModal = () => {
    setPrefilledInquiry({
      car_id: car.id,
      car_name: car.name,
    });
    setIsInquiryModalOpen(true);
  };

  // Related vehicles (published, excluding current vehicle)
  const relatedVehicles = allCars
    .filter((c) => c.is_active && c.id !== car.id && c.slug !== car.slug)
    .slice(0, 3);

  // Default amenities if empty
  const amenitiesList =
    car.amenities && car.amenities.length > 0
      ? car.amenities
      : [
          'Captain Reclining Seats',
          'Dual Air Conditioning',
          'Fast USB Chargers',
          'Spacious Luggage Boot',
          'Professional Highway Chauffeur',
        ];

  // Inclusions checklist
  const keyInclusions =
    car.key_features && car.key_features.length > 0
      ? car.key_features
      : [
          'Uniformed, commercial license verified highway chauffeur',
          'Automated Expressway Fastag pass - Zero roadside stops',
          '100% Sanitized cabin - Chilled mineral water included',
        ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-[#F5B936]/20">
      {/* 1. Global Navigation Header */}
      <Header
        onOpenInquiry={handleOpenBookModal}
        phone={settings?.phone}
        whatsapp={settings?.whatsapp}
      />

      <main className="flex-1 pt-24 sm:pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 2. Breadcrumbs & Back Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 text-xs text-slate-500">
            <Link
              to="/#fleet"
              className="inline-flex items-center gap-2 font-bold text-[#081A33] hover:text-[#F5B936] transition-colors w-fit group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Fleet Collection</span>
            </Link>

            <div className="flex items-center gap-1.5 font-medium text-slate-400">
              <Link to="/#fleet" className="hover:text-slate-600 transition-colors">
                Fleet
              </Link>
              <span>&gt;</span>
              <span className="capitalize">{car.category || car.car_type || 'Vehicle'}</span>
              <span>&gt;</span>
              <span className="text-[#081A33] font-bold">{car.name}</span>
            </div>
          </div>

          {/* 3. Vehicle Title & Tagline Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#B87A04] mb-1">
                {car.tagline || `${car.manufacturer || 'ROYALRIDES'} • ${car.category || car.car_type || 'EDITION'}`}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#081A33] tracking-tight">
                {car.name}
              </h1>
            </div>

            {/* Rating & Completed Tours */}
            <div className="flex items-center gap-2 text-xs font-bold text-[#081A33] bg-amber-50 border border-amber-200/80 px-3.5 py-1.5 rounded-full w-fit">
              <Star className="w-4 h-4 fill-[#F5B936] text-[#F5B936]" />
              <span className="font-extrabold">{car.rating || 5}</span>
              <span className="text-slate-500 font-medium">
                ({car.completed_tours || `${car.review_count || '400+'} Completed Tours`})
              </span>
            </div>
          </div>

          {/* 4. Two-Column Showcase: Left Image Gallery & Right Tariff Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-12">
            {/* LEFT COLUMN: Vehicle Gallery */}
            <div className="lg:col-span-7 flex flex-col">
              {/* Primary Image Preview Box */}
              <div className="relative w-full h-[320px] sm:h-[400px] md:h-[450px] bg-white rounded-3xl border border-slate-200/80 shadow-md flex items-center justify-center p-6 sm:p-8 overflow-hidden group select-none">
                <Image
                  src={currentImage}
                  alt={car.name}
                  fill
                  className="object-contain p-4 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 600px"
                  priority
                />

                {/* Left Arrow overlay */}
                {galleryImages.length > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    aria-label="Previous vehicle image"
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#081A33] border border-slate-200 shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>
                )}

                {/* Right Arrow overlay */}
                {galleryImages.length > 1 && (
                  <button
                    type="button"
                    onClick={handleNextImage}
                    aria-label="Next vehicle image"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#081A33] border border-slate-200 shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                  </button>
                )}

                {/* Image Counter Badge */}
                <div className="absolute right-4 bottom-4 px-3 py-1 rounded-full bg-[#081A33]/80 backdrop-blur-xs text-white text-[11px] font-bold shadow-xs">
                  {activeImageIndex + 1} / {galleryImages.length}
                </div>
              </div>

              {/* Thumbnails Row */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2 no-scrollbar">
                  {galleryImages.map((img, idx) => {
                    const isActive = idx === activeImageIndex;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        aria-label={`Select vehicle thumbnail ${idx + 1}`}
                        className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-2xl bg-white border-2 overflow-hidden shrink-0 transition-all cursor-pointer ${
                          isActive
                            ? 'border-[#F5B936] ring-2 ring-[#F5B936]/30 shadow-md scale-102'
                            : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${car.name} thumbnail ${idx + 1}`}
                          fill
                          className="object-contain p-1"
                          sizes="96px"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Transparent Tariff Breakdown Card */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md flex flex-col justify-between h-full">
                <div>
                  {/* Card Section Header */}
                  <div className="flex items-center justify-between gap-2 mb-6">
                    <span className="text-[11px] font-extrabold tracking-widest uppercase text-slate-400">
                      TRANSPARENT TARIFF BREAKDOWN
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Best Rate Guarantee</span>
                    </span>
                  </div>

                  {/* 2 Tariff Highlight Boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {/* Outstation Tariff Box */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        OUTSTATION PER KM
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-[#081A33]">
                          ₹{outstationPrice}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">/km</span>
                      </div>
                      <span className="block text-[11px] text-slate-500 font-medium mt-1">
                        {minKms}
                      </span>
                    </div>

                    {/* City Daily Package Box */}
                    <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-[#F5B936]/30">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#B87A04] mb-1">
                        CITY DAILY PACKAGE
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-[#081A33]">
                          ₹{dailyPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">/day</span>
                      </div>
                      <span className="block text-[11px] text-slate-600 font-medium mt-1">
                        {packageHours} • {packageIncludedKm}
                      </span>
                    </div>
                  </div>

                  {/* Pricing Key Inclusions */}
                  <div className="space-y-3 mb-8 pt-2">
                    {keyInclusions.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium leading-relaxed">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  {/* WhatsApp Action Button */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20BA5C] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>ENQUIRE AVAILABILITY ON WHATSAPP</span>
                  </a>

                  {/* Reserve Online via Fleet Desk Button */}
                  <button
                    type="button"
                    onClick={handleOpenBookModal}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#081A33] hover:bg-[#122D52] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                  >
                    <span>RESERVE ONLINE VIA FLEET DESK</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  {/* VIP Call Link */}
                  <div className="text-center pt-2">
                    <a
                      href={`tel:+${cleanPhone}`}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#081A33] font-semibold transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#F5B936]" />
                      <span>Prefer to call? </span>
                      <span className="font-bold text-[#081A33]">{rawPhone}</span>
                      <span className="text-[11px] text-slate-400">(24/7 VIP Line)</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Key Telemetry Badges (4 cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#B87A04] shrink-0">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-sm sm:text-base font-black text-[#081A33]">
                  {car.max_speed || '180 km/h'}
                </span>
                <span className="block text-[11px] text-slate-400 font-semibold">
                  Top Speed
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-sm sm:text-base font-black text-[#081A33]">
                  {car.horsepower || 'High Output'}
                </span>
                <span className="block text-[11px] text-slate-400 font-semibold">
                  Horsepower
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-sm sm:text-base font-black text-[#081A33]">
                  {car.seating_capacity || '7 Seats'}
                </span>
                <span className="block text-[11px] text-slate-400 font-semibold">
                  Capacity
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-600 shrink-0">
                <CogIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-sm sm:text-base font-black text-[#081A33]">
                  {car.transmission || 'Automatic'}
                </span>
                <span className="block text-[11px] text-slate-400 font-semibold">
                  Transmission
                </span>
              </div>
            </div>
          </div>

          {/* 6. Highlight Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF9EE] border border-[#F5B936]/30 flex items-center gap-3 mb-12 shadow-2xs">
            <Sparkles className="w-5 h-5 text-[#F5B936] shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-[#8A5E00]">
              {car.highlights?.[0] || 'Ideal for Surat - Mumbai & Udaipur road trips'}
            </span>
          </div>

          {/* 7. Engineering Specs & Telemetry Grid */}
          <div className="mb-14">
            <div className="mb-6">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B87A04] block mb-1">
                ENGINEERING SPECS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#081A33]">
                Technical Specifications & Telemetry
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Maintained strictly to manufacturer schedule with OEM diagnostics and certified Michelin / Pirelli rubber.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  ENGINE & POWERTRAIN
                </span>
                <span className="block text-sm font-extrabold text-[#081A33]">
                  {car.engine || 'High Output'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  HORSEPOWER RATING
                </span>
                <span className="block text-sm font-extrabold text-[#081A33]">
                  {car.horsepower || 'High Output'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  TRANSMISSION
                </span>
                <span className="block text-sm font-extrabold text-[#081A33]">
                  {car.transmission || 'Automatic'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  DRIVETRAIN & FUEL
                </span>
                <span className="block text-sm font-extrabold text-[#081A33]">
                  {car.fuel_type || 'Diesel'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  PASSENGER SEATING
                </span>
                <span className="block text-sm font-extrabold text-[#081A33]">
                  {car.seating_capacity || '7 Captain Seats'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  MAXIMUM SPEED
                </span>
                <span className="block text-sm font-extrabold text-[#081A33]">
                  {car.max_speed || '180 km/h'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  DRIVER OPTION
                </span>
                <span className="block text-sm font-extrabold text-[#081A33]">
                  {car.driver_option || 'Chauffeur / Self-Drive'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  LUGGAGE CAPACITY
                </span>
                <span className="block text-sm font-extrabold text-[#081A33]">
                  {car.luggage_capacity || '3-5 Large Trolleys'}
                </span>
              </div>
            </div>
          </div>

          {/* 8. Factory Amenities & Comfort Options */}
          <div className="mb-14">
            <div className="mb-6">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B87A04] block mb-1">
                FACTORY AMENITIES & COMFORT OPTIONS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#081A33]">
                Comfort & Safety Features
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {amenitiesList.map((amenity, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#081A33]">
                    {amenity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 9. Explore More Fleet Models (Related Vehicles) */}
          {relatedVehicles.length > 0 && (
            <div className="pt-10 border-t border-slate-200">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B87A04] block mb-1">
                    OTHER VEHICLES
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#081A33]">
                    Explore More Fleet Models
                  </h3>
                </div>
                <Link
                  to="/#fleet"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#081A33] hover:text-[#F5B936] transition-colors"
                >
                  <span>View Full Fleet</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedVehicles.map((relCar) => {
                  const relOutstation = relCar.outstation_price_per_km ?? 15;
                  const relDaily = relCar.daily_package_price ?? 3500;
                  const relSlug = relCar.slug || relCar.id;

                  return (
                    <div
                      key={relCar.id || relCar.slug}
                      onClick={() => navigate(`/fleet/${relSlug}`)}
                      className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-[#F5B936]/60 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                    >
                      <div>
                        {/* Image */}
                        <div className="relative w-full h-36 mb-3 flex items-center justify-center overflow-hidden">
                          <Image
                            src={relCar.image_url}
                            alt={relCar.name}
                            fill
                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, 300px"
                          />
                        </div>

                        {/* Title */}
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {relCar.category || relCar.car_type}
                        </span>
                        <h4 className="text-base font-extrabold text-[#081A33] group-hover:text-[#F5B936] transition-colors mt-0.5">
                          {relCar.name}
                        </h4>

                        {/* Specs */}
                        <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 font-medium">
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>{relCar.seating_capacity}</span>
                          </span>
                          <span>•</span>
                          <span>{relCar.fuel_type || 'Diesel'}</span>
                        </div>
                      </div>

                      {/* Pricing & Link */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-[#081A33]">
                            ₹{relOutstation}/km
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Daily: ₹{relDaily.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <span className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-[#081A33] group-hover:text-white flex items-center justify-center text-slate-600 transition-colors">
                          <ArrowUpRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 10. Footer */}
      <Footer settings={settings} />

      {/* 11. Reusable Popup Inquiry Modal */}
      <InquiryModal
        open={isInquiryModalOpen}
        onOpenChange={setIsInquiryModalOpen}
        cars={allCars}
        prefilledData={prefilledInquiry}
        onSuccess={loadData}
      />

      {/* 12. Floating Contact Widget */}
      <FloatingContactWidget settings={settings} />
    </div>
  );
}
