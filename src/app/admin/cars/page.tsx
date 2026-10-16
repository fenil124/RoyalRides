'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from '@/components/common/Image';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  X,
  Upload,
  AlertCircle,
  Loader2,
  Power,
  Sparkles,
  ExternalLink,
  Eye,
  Check,
  Fuel,
  Settings as TransmissionIcon,
  Tag,
  DollarSign,
  Layers,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { DataStore, slugify } from '@/lib/data-store';
import { Car } from '@/types';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { VEHICLE_IMAGES } from '@/lib/constants/default-images';
import { ImageFieldManager } from '@/components/admin/ImageFieldManager';

const CANONICAL_HERO_SLOTS = [
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    defaultName: 'Ertiga',
    defaultImage: VEHICLE_IMAGES['ertiga'].transparent,
    label: 'Position 1 (Initial Active)',
  },
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    defaultName: 'Innova',
    defaultImage: VEHICLE_IMAGES['innova'].transparent,
    label: 'Position 2 (Supporting Right)',
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    defaultName: 'Swift Dzire',
    defaultImage: VEHICLE_IMAGES['swift-dzire'].transparent,
    label: 'Position 3 (Supporting Left)',
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    defaultName: 'Urbania Traveller',
    defaultImage: VEHICLE_IMAGES['urbania'].transparent,
    label: 'Position 4 (Far Supporting Right)',
  },
];

const STANDARD_AMENITIES = [
  'Captain Reclining Seats',
  'Dual Air Conditioning',
  'Fast USB Chargers',
  'Spacious Luggage Boot',
  'Professional Highway Chauffeur',
  'Bluetooth Audio System',
  'Individual Reading Lamps',
  'Air Suspension',
  'Cooled Cupholders',
  'Panoramic Touring Windows',
];

const CATEGORIES = ['MPV', 'Sedan', 'Luxury', 'SUV', 'Tempo Traveller', 'Luxury Van'];

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Published' | 'Draft'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'specs' | 'amenities' | 'images'>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields - Basic
  const [formName, setFormName] = useState('');
  const [formManufacturer, setFormManufacturer] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('MPV');
  const [formTagline, setFormTagline] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formRating, setFormRating] = useState('4.9');
  const [formReviewCount, setFormReviewCount] = useState('1,000+');
  const [formDisplayOrder, setFormDisplayOrder] = useState('1');
  const [formActive, setFormActive] = useState(true);
  const [formHeroFeatured, setFormHeroFeatured] = useState(true);
  const [formShortDescription, setFormShortDescription] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Form Fields - Pricing
  const [formOutstationPrice, setFormOutstationPrice] = useState('18');
  const [formDailyPrice, setFormDailyPrice] = useState('4500');
  const [formMinKmPerDay, setFormMinKmPerDay] = useState('Min. 250-300 kms/day');
  const [formPackageHours, setFormPackageHours] = useState('8 Hours');
  const [formPackageIncludedKm, setFormPackageIncludedKm] = useState('80 km Included');
  const [formDriverAllowance, setFormDriverAllowance] = useState('300');
  const [formExtraKmCharge, setFormExtraKmCharge] = useState('18');
  const [formExtraHourCharge, setFormExtraHourCharge] = useState('150');

  // Form Fields - Specs
  const [formSeating, setFormSeating] = useState('7 Seats');
  const [formFuelType, setFormFuelType] = useState('Diesel');
  const [formTransmission, setFormTransmission] = useState('Automatic');
  const [formEngine, setFormEngine] = useState('High Output');
  const [formHorsepower, setFormHorsepower] = useState('High Output');
  const [formMaxSpeed, setFormMaxSpeed] = useState('180 km/h');
  const [formDriverOption, setFormDriverOption] = useState('Chauffeur / Self-Drive');
  const [formLuggageCapacity, setFormLuggageCapacity] = useState('3-4 Large Trolleys');
  const [formHighlightsText, setFormHighlightsText] = useState('Ideal for Surat - Mumbai & Udaipur road trips');

  // Form Fields - Amenities
  const [formAmenities, setFormAmenities] = useState<string[]>([]);
  const [customAmenityInput, setCustomAmenityInput] = useState('');

  // Form Fields - Images
  const [formImageUrl, setFormImageUrl] = useState(VEHICLE_IMAGES['innova'].transparent);
  const [formHeroImageUrl, setFormHeroImageUrl] = useState('');
  const [syncHeroAndFleet, setSyncHeroAndFleet] = useState(true);
  const [formGalleryImages, setFormGalleryImages] = useState<string[]>([]);
  const [newGalleryUrlInput, setNewGalleryUrlInput] = useState('');

  // Delete Target
  const [deleteTarget, setDeleteTarget] = useState<Car | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCars = useCallback(async () => {
    setLoading(true);
    try {
      const data = await DataStore.getCars();
      setCars(data);
    } catch (err) {
      console.error('Error loading cars:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCars();
    const unsubscribe = DataStore.subscribe(() => {
      loadCars();
    });
    return () => unsubscribe();
  }, [loadCars]);

  const getHeroCar = (slot: typeof CANONICAL_HERO_SLOTS[0]): Car => {
    const found =
      cars.find((c) => c.id === slot.id) ||
      cars.find((c) => c.name.toLowerCase() === slot.defaultName.toLowerCase()) ||
      cars.find((c) => c.name.toLowerCase().includes(slot.defaultName.toLowerCase().split(' ')[0]));

    if (found) return found;

    return {
      id: slot.id,
      name: slot.defaultName,
      car_type: slot.defaultName === 'Urbania Traveller' ? 'Luxury Van' : slot.defaultName === 'Swift Dzire' ? 'Sedan' : 'MPV',
      seating_capacity: slot.defaultName === 'Urbania Traveller' ? '12+1 Seating' : slot.defaultName === 'Swift Dzire' ? '4+1 Seating' : '7+1 Seating',
      image_url: slot.defaultImage,
      hero_image_url: slot.defaultImage,
      is_active: true,
      is_hero_featured: true,
      display_order: 1,
    };
  };

  const openAddModal = () => {
    setEditingCar(null);
    setFormName('');
    setFormManufacturer('');
    setFormModel('');
    setFormSlug('');
    setFormCategory('MPV');
    setFormTagline('');
    setFormBadge('NEW FLEET');
    setFormRating('4.9');
    setFormReviewCount('1,000+');
    setFormDisplayOrder(String(cars.length + 1));
    setFormActive(true);
    setFormHeroFeatured(false);
    setFormShortDescription('');
    setFormDescription('');

    setFormOutstationPrice('18');
    setFormDailyPrice('4500');
    setFormMinKmPerDay('Min. 250-300 kms/day');
    setFormPackageHours('8 Hours');
    setFormPackageIncludedKm('80 km Included');
    setFormDriverAllowance('300');
    setFormExtraKmCharge('18');
    setFormExtraHourCharge('150');

    setFormSeating('7 Seats');
    setFormFuelType('Diesel');
    setFormTransmission('Automatic');
    setFormEngine('High Output');
    setFormHorsepower('High Output');
    setFormMaxSpeed('180 km/h');
    setFormDriverOption('Chauffeur / Self-Drive');
    setFormLuggageCapacity('3-4 Large Trolleys');
    setFormHighlightsText('Ideal for Surat - Mumbai & Udaipur road trips');

    setFormAmenities([
      'Captain Reclining Seats',
      'Dual Air Conditioning',
      'Fast USB Chargers',
      'Spacious Luggage Boot',
      'Professional Highway Chauffeur',
    ]);
    setCustomAmenityInput('');

    setFormImageUrl(VEHICLE_IMAGES['innova'].transparent);
    setFormHeroImageUrl(VEHICLE_IMAGES['innova'].transparent);
    setSyncHeroAndFleet(true);
    setFormGalleryImages([VEHICLE_IMAGES['innova'].transparent]);

    setActiveTab('basic');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (
    car: Car,
    defaultTab: 'basic' | 'pricing' | 'specs' | 'amenities' | 'images' = 'basic'
  ) => {
    setEditingCar(car);
    setFormName(car.name);
    setFormManufacturer(car.manufacturer || (car.name.split(' ')[0] || ''));
    setFormModel(car.model || car.name);
    setFormSlug(car.slug || slugify(car.name));
    setFormCategory(car.category || car.car_type || 'MPV');
    setFormTagline(car.tagline || '');
    setFormBadge(car.badge || '');
    setFormRating(String(car.rating || 4.9));
    setFormReviewCount(String(car.review_count || '1,000+'));
    setFormDisplayOrder(String(car.display_order || 1));
    setFormActive(car.is_active);
    setFormHeroFeatured(car.is_hero_featured);
    setFormShortDescription(car.short_description || '');
    setFormDescription(car.description || '');

    setFormOutstationPrice(String(car.outstation_price_per_km ?? 18));
    setFormDailyPrice(String(car.daily_package_price ?? 4500));
    setFormMinKmPerDay(car.min_km_per_day || 'Min. 250-300 kms/day');
    setFormPackageHours(car.package_hours || '8 Hours');
    setFormPackageIncludedKm(car.package_included_km || '80 km Included');
    setFormDriverAllowance(String(car.driver_allowance ?? 300));
    setFormExtraKmCharge(String(car.extra_km_charge ?? 18));
    setFormExtraHourCharge(String(car.extra_hour_charge ?? 150));

    setFormSeating(car.seating_capacity || '7 Seats');
    setFormFuelType(car.fuel_type || 'Diesel');
    setFormTransmission(car.transmission || 'Automatic');
    setFormEngine(car.engine || 'High Output');
    setFormHorsepower(car.horsepower || 'High Output');
    setFormMaxSpeed(car.max_speed || '180 km/h');
    setFormDriverOption(car.driver_option || 'Chauffeur / Self-Drive');
    setFormLuggageCapacity(car.luggage_capacity || '3-4 Large Trolleys');
    setFormHighlightsText(car.highlights?.join(', ') || 'Ideal for Surat - Mumbai & Udaipur road trips');

    setFormAmenities(car.amenities && car.amenities.length > 0 ? car.amenities : [
      'Captain Reclining Seats',
      'Dual Air Conditioning',
      'Fast USB Chargers',
      'Spacious Luggage Boot',
      'Professional Highway Chauffeur',
    ]);
    setCustomAmenityInput('');

    const heroImg = car.hero_image_url || car.image_url || '';
    const fleetImg = car.image_url || car.hero_image_url || '';
    setFormImageUrl(fleetImg);
    setFormHeroImageUrl(heroImg);
    setSyncHeroAndFleet(!car.hero_image_url || !car.image_url || car.hero_image_url === car.image_url);
    setFormGalleryImages(car.gallery_images && car.gallery_images.length > 0 ? car.gallery_images : [fleetImg].filter(Boolean));

    setActiveTab(defaultTab);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleTogglePublish = async (car: Car) => {
    try {
      const newStatus = !car.is_active;
      await DataStore.saveCar({
        ...car,
        is_active: newStatus,
      });
      toast.success(`${car.name} is now ${newStatus ? 'Published' : 'Draft / Unpublished'}`);
      loadCars();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update publication status');
    }
  };

  const handleAddGalleryUrl = () => {
    if (!newGalleryUrlInput.trim()) return;
    const url = newGalleryUrlInput.trim();
    if (!formGalleryImages.includes(url)) {
      setFormGalleryImages((prev) => [...prev, url]);
      toast.success('Image added to gallery');
    }
    setNewGalleryUrlInput('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleAmenity = (amenity: string) => {
    setFormAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleAddCustomAmenity = () => {
    const trimmed = customAmenityInput.trim();
    if (!trimmed) return;
    if (!formAmenities.includes(trimmed)) {
      setFormAmenities((prev) => [...prev, trimmed]);
      toast.success(`Added amenity: "${trimmed}"`);
    }
    setCustomAmenityInput('');
  };

  const handleSaveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMessage('Vehicle name is required');
      setActiveTab('basic');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const finalHeroImageUrl = formHeroImageUrl.trim() || formImageUrl.trim();
      const finalImageUrl = formImageUrl.trim() || formHeroImageUrl.trim();

      if (!finalImageUrl && !finalHeroImageUrl) {
        setErrorMessage('At least one vehicle image (URL or uploaded file) is required.');
        setActiveTab('images');
        setIsSaving(false);
        return;
      }

      const generatedSlug = formSlug.trim() || slugify(formName);
      const parsedHighlights = formHighlightsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const gallery =
        formGalleryImages.length > 0
          ? formGalleryImages
          : [finalImageUrl, finalHeroImageUrl].filter(Boolean);

      const payload: Partial<Car> = {
        id: editingCar ? editingCar.id : undefined,
        name: formName.trim(),
        manufacturer: formManufacturer.trim() || formName.split(' ')[0],
        model: formModel.trim() || formName,
        slug: generatedSlug,
        car_type: formCategory,
        category: formCategory,
        tagline: formTagline.trim(),
        badge: formBadge.trim(),
        rating: parseFloat(formRating) || 4.9,
        review_count: formReviewCount.trim() || '1,000+',
        display_order: parseInt(formDisplayOrder, 10) || 1,
        is_active: formActive,
        is_hero_featured: formHeroFeatured,
        short_description: formShortDescription.trim(),
        description: formDescription.trim(),

        outstation_price_per_km: parseFloat(formOutstationPrice) || 18,
        daily_package_price: parseFloat(formDailyPrice) || 4500,
        min_km_per_day: formMinKmPerDay.trim(),
        package_hours: formPackageHours.trim(),
        package_included_km: formPackageIncludedKm.trim(),
        driver_allowance: parseFloat(formDriverAllowance) || 300,
        extra_km_charge: parseFloat(formExtraKmCharge) || parseFloat(formOutstationPrice) || 18,
        extra_hour_charge: parseFloat(formExtraHourCharge) || 150,

        seating_capacity: formSeating.trim(),
        fuel_type: formFuelType.trim(),
        transmission: formTransmission.trim(),
        engine: formEngine.trim(),
        horsepower: formHorsepower.trim(),
        max_speed: formMaxSpeed.trim(),
        driver_option: formDriverOption.trim(),
        luggage_capacity: formLuggageCapacity.trim(),
        highlights: parsedHighlights,
        amenities: formAmenities,

        image_url: finalImageUrl,
        hero_image_url: finalHeroImageUrl,
        gallery_images: gallery,
      };

      await DataStore.saveCar(payload);

      toast.success(editingCar ? 'Vehicle updated successfully' : 'New vehicle published to fleet');
      setIsModalOpen(false);
      await loadCars();
    } catch (err: any) {
      const msg = err?.message || 'Failed to save vehicle.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await DataStore.deleteCar(deleteTarget.id);
      toast.success(`${deleteTarget.name} removed from fleet`);
      setDeleteTarget(null);
      loadCars();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete vehicle');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered cars list
  const filteredCars = cars.filter((c) => {
    if (statusFilter === 'Published' && !c.is_active) return false;
    if (statusFilter === 'Draft' && c.is_active) return false;

    if (categoryFilter !== 'All') {
      const cat = (c.category || c.car_type || '').toLowerCase();
      if (!cat.includes(categoryFilter.toLowerCase())) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.manufacturer && c.manufacturer.toLowerCase().includes(q)) ||
        (c.model && c.model.toLowerCase().includes(q)) ||
        c.car_type.toLowerCase().includes(q) ||
        (c.slug && c.slug.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 select-none pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5B936] uppercase tracking-wider mb-1">
            <span>ADMIN FLEET REGISTRY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2C50] tracking-tight">
            Vehicle &amp; Fleet Management
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Manage your fleet of vehicles, tariffs, specifications, amenities, and image assets.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5B936] hover:bg-[#E5A928] text-[#071A35] font-extrabold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* 2. Hero Stage Vehicles Quick Preview (Regression Preservation) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F5B936]" />
            <h2 className="text-sm font-bold text-[#081A33]">
              Homepage Hero Showcase Vehicles
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Active in 2.5s Homepage Stage
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CANONICAL_HERO_SLOTS.map((slot) => {
            const heroCar = getHeroCar(slot);
            return (
              <div
                key={slot.id}
                onClick={() => openEditModal(heroCar, 'images')}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 mb-1">
                    {slot.label}
                  </span>
                  <div className="relative w-full h-20 mb-2 flex items-center justify-center">
                    <Image
                      src={heroCar.hero_image_url || heroCar.image_url || slot.defaultImage}
                      alt={heroCar.name}
                      fill
                      className="object-contain p-1 group-hover:scale-105 transition-transform"
                      sizes="150px"
                    />
                  </div>
                  <h3 className="text-xs font-bold text-[#081A33] group-hover:text-[#F5B936] transition-colors truncate">
                    {heroCar.name}
                  </h3>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                  <span>{heroCar.seating_capacity}</span>
                  <span className="font-bold text-[#081A33] group-hover:text-[#F5B936] flex items-center gap-1">
                    <Edit className="w-3 h-3 text-[#F5B936]" />
                    <span>Edit Specs</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Main Fleet Registry Search, Filters & Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by vehicle name, manufacturer, model, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936] bg-slate-50/50"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none focus:border-[#F5B936]"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
              {(['All', 'Published', 'Draft'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === st
                      ? 'bg-white text-[#081A33] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vehicle Management Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Outstation</th>
                <th className="py-3 px-4">Daily Package</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#F5B936]" />
                    <span>Loading vehicle fleet registry...</span>
                  </td>
                </tr>
              ) : filteredCars.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                      <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="font-bold text-slate-600 mb-1">No vehicles matched your search</p>
                    <p className="text-xs">Try clearing filters or add a new vehicle to your fleet.</p>
                  </td>
                </tr>
              ) : (
                filteredCars.map((car) => {
                  const outstation = car.outstation_price_per_km ?? 15;
                  const daily = car.daily_package_price ?? 3500;
                  const targetSlug = car.slug || slugify(car.name);

                  return (
                    <tr
                      key={car.id || car.slug}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Vehicle Identity & Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-11 rounded-xl bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                            <Image
                              src={car.image_url}
                              alt={car.name}
                              fill
                              className="object-contain p-1"
                              sizes="60px"
                            />
                          </div>
                          <div>
                            <div className="font-extrabold text-[#081A33] group-hover:text-[#F5B936] transition-colors">
                              {car.name}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-medium">
                              <span>{car.manufacturer || 'RoyalRides'}</span>
                              <span>•</span>
                              <span className="font-mono text-slate-500">/fleet/{targetSlug}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[#081A33] text-[11px] font-bold">
                          {car.category || car.car_type}
                        </span>
                      </td>

                      {/* Capacity */}
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {car.seating_capacity}
                      </td>

                      {/* Outstation Tariff */}
                      <td className="py-3 px-4 font-bold text-[#081A33]">
                        ₹{outstation}/km
                      </td>

                      {/* Daily Package */}
                      <td className="py-3 px-4 font-bold text-amber-700">
                        ₹{daily.toLocaleString('en-IN')}/day
                      </td>

                      {/* Publication Status Toggle */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(car)}
                          title={`Click to ${car.is_active ? 'Unpublish (Draft)' : 'Publish'}`}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase transition-all cursor-pointer ${
                            car.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              car.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          <span>{car.is_active ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>

                      {/* Display Order */}
                      <td className="py-3 px-4 font-mono font-semibold text-slate-500">
                        #{car.display_order}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live Preview Button */}
                          <a
                            href={`/fleet/${targetSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Preview Public Vehicle Details Page"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#081A33] hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => openEditModal(car)}
                            title="Edit Vehicle Information"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#081A33] hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(car)}
                            title="Delete Vehicle"
                            className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Complete Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081A33]/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#081A33]">
                  {editingCar ? `Edit ${editingCar.name}` : 'Add New Vehicle to Fleet'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure vehicle specifications, transparent pricing, comfort amenities, and image assets.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="px-6 border-b border-slate-200 flex items-center gap-1 overflow-x-auto bg-white no-scrollbar">
              {[
                { id: 'basic', label: '1. Basic Info' },
                { id: 'pricing', label: '2. Pricing & Tariffs' },
                { id: 'specs', label: '3. Technical Specs' },
                { id: 'amenities', label: '4. Amenities' },
                { id: 'images', label: '5. Image Management' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-[#F5B936] text-[#081A33]'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Content */}
            <form onSubmit={handleSaveCar} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: BASIC INFO */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Vehicle Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Toyota Innova Crysta"
                        value={formName}
                        onChange={(e) => {
                          setFormName(e.target.value);
                          if (!editingCar && !formSlug) {
                            setFormSlug(slugify(e.target.value));
                          }
                        }}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        URL Slug <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. innova"
                        value={formSlug}
                        onChange={(e) => setFormSlug(slugify(e.target.value))}
                        className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                      <span className="block text-[10px] text-slate-400 mt-1">
                        Public route: /fleet/{formSlug || 'slug'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Manufacturer
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Toyota, Force, Maruti Suzuki"
                        value={formManufacturer}
                        onChange={(e) => setFormManufacturer(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Model
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Innova Crysta"
                        value={formModel}
                        onChange={(e) => setFormModel(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Category
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936] bg-white font-semibold"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Badge Label (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. MOST POPULAR, FAMILY FAVORITE"
                        value={formBadge}
                        onChange={(e) => setFormBadge(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tagline / Edition Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. FORCE • TEMPO TRAVELLER EDITION"
                        value={formTagline}
                        onChange={(e) => setFormTagline(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formDisplayOrder}
                        onChange={(e) => setFormDisplayOrder(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Customer Rating (1.0 to 5.0)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={formRating}
                        onChange={(e) => setFormRating(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Review Count / Completed Tours
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1,450+ or 400+ Completed Tours"
                        value={formReviewCount}
                        onChange={(e) => setFormReviewCount(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Short Overview / Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief highlight of this vehicle for cards and summary..."
                      value={formShortDescription}
                      onChange={(e) => setFormShortDescription(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                    />
                  </div>

                  {/* Status switches */}
                  <div className="pt-2 flex flex-wrap items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formActive}
                        onChange={(e) => setFormActive(e.target.checked)}
                        className="w-4 h-4 rounded text-[#081A33] focus:ring-[#F5B936]"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        Publish to Public Website &amp; Carousel
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formHeroFeatured}
                        onChange={(e) => setFormHeroFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-[#081A33] focus:ring-[#F5B936]"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        Featured on Hero Showcase Stage
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING & TARIFFS */}
              {activeTab === 'pricing' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 leading-relaxed mb-4">
                    Set transparent rates used by the public fleet carousel cards, vehicle details breakdown, and quotation estimator.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Outstation Tariff (₹ / km) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        required
                        placeholder="e.g. 18"
                        value={formOutstationPrice}
                        onChange={(e) => setFormOutstationPrice(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-bold text-[#081A33] rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        City Daily Package (₹ / day) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        placeholder="e.g. 4500"
                        value={formDailyPrice}
                        onChange={(e) => setFormDailyPrice(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-bold text-amber-800 rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Minimum Kilometers (per day)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Min. 250-300 kms/day"
                        value={formMinKmPerDay}
                        onChange={(e) => setFormMinKmPerDay(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Daily Package Hours
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 8 Hours"
                        value={formPackageHours}
                        onChange={(e) => setFormPackageHours(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Package Included Distance
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 80 km Included"
                        value={formPackageIncludedKm}
                        onChange={(e) => setFormPackageIncludedKm(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Driver Allowance (₹ / day)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 300"
                        value={formDriverAllowance}
                        onChange={(e) => setFormDriverAllowance(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Extra KM Charge (₹ / km)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 18"
                        value={formExtraKmCharge}
                        onChange={(e) => setFormExtraKmCharge(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Extra Hour Charge (₹ / hr)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 150"
                        value={formExtraHourCharge}
                        onChange={(e) => setFormExtraHourCharge(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TECHNICAL SPECS */}
              {activeTab === 'specs' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Seating Capacity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 7 Seats or 12+1 Seating"
                        value={formSeating}
                        onChange={(e) => setFormSeating(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Fuel Type
                      </label>
                      <select
                        value={formFuelType}
                        onChange={(e) => setFormFuelType(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936] bg-white"
                      >
                        <option value="Diesel">Diesel</option>
                        <option value="Petrol / CNG">Petrol / CNG</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Transmission
                      </label>
                      <select
                        value={formTransmission}
                        onChange={(e) => setFormTransmission(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936] bg-white"
                      >
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Engine &amp; Powertrain
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2.4L GD Turbo Diesel or High Output"
                        value={formEngine}
                        onChange={(e) => setFormEngine(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Horsepower Rating
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 148 HP or High Output"
                        value={formHorsepower}
                        onChange={(e) => setFormHorsepower(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Maximum Speed
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 180 km/h or 240 km/h"
                        value={formMaxSpeed}
                        onChange={(e) => setFormMaxSpeed(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Driver Option
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Chauffeur / Self-Drive"
                        value={formDriverOption}
                        onChange={(e) => setFormDriverOption(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Luggage Capacity
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 3-5 Large Trolleys"
                        value={formLuggageCapacity}
                        onChange={(e) => setFormLuggageCapacity(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Vehicle Highlights (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ideal for Surat - Mumbai & Udaipur road trips, Air suspension"
                      value={formHighlightsText}
                      onChange={(e) => setFormHighlightsText(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: AMENITIES */}
              {activeTab === 'amenities' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    Select features and comfort amenities included with this vehicle. They appear with checkmarks on the public details page.
                  </div>

                  {/* Standard Amenities Checkbox Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {STANDARD_AMENITIES.map((item) => {
                      const isChecked = formAmenities.includes(item);
                      return (
                        <div
                          key={item}
                          onClick={() => handleToggleAmenity(item)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                            isChecked
                              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                              isChecked ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs">{item}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom Amenities Input */}
                  <div className="pt-3 border-t border-slate-200">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Add Custom Amenity
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Child Safety Seat Available"
                        value={customAmenityInput}
                        onChange={(e) => setCustomAmenityInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomAmenity();
                          }
                        }}
                        className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomAmenity}
                        className="px-4 py-2.5 rounded-xl bg-[#081A33] hover:bg-[#122D52] text-white text-xs font-bold cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    {/* Selected Custom Amenities Tags */}
                    {formAmenities.filter((a) => !STANDARD_AMENITIES.includes(a)).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formAmenities
                          .filter((a) => !STANDARD_AMENITIES.includes(a))
                          .map((custom) => (
                            <span
                              key={custom}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold"
                            >
                              <span>{custom}</span>
                              <button
                                type="button"
                                onClick={() => handleToggleAmenity(custom)}
                                className="hover:text-red-600"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: IMAGE MANAGEMENT (URL or FILE UPLOAD) */}
              {activeTab === 'images' && (
                <div className="space-y-6">
                  {/* Sync Toggle */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-[#F5B936]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-[#F5B936] shrink-0" />
                      <div>
                        <span className="block text-xs font-bold text-[#081A33]">
                          Sync Hero Showcase Image &amp; Fleet Card Image
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          When enabled, setting either image updates both fields automatically. Turn off if you wish to maintain a separate transparent cutout for the Hero 3D Stage and a photo for the Fleet Card.
                        </span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={syncHeroAndFleet}
                        onChange={(e) => setSyncHeroAndFleet(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F5B936]"></div>
                    </label>
                  </div>

                  {/* 1. Homepage Hero Showcase Image */}
                  <ImageFieldManager
                    label="Homepage Hero Showcase Image (3D Stage & Carousel)"
                    helpText="Image displayed on the 3D rotating stage with the glowing neon ring on the public homepage. Transparent background PNG cutouts look best."
                    value={formHeroImageUrl}
                    onChange={(url) => {
                      setFormHeroImageUrl(url);
                      if (syncHeroAndFleet) {
                        setFormImageUrl(url);
                      }
                    }}
                    aspectRatio="contain"
                    placeholder="https://example.com/transparent-car-cutout.png"
                    required
                  />

                  {/* 2. Primary Fleet Card Image */}
                  <ImageFieldManager
                    label="Fleet Card & Listing Image (image_url)"
                    helpText="Image displayed on vehicle cards across the website (/fleet listing, homepage fleet cards, and booking selectors)."
                    value={formImageUrl}
                    onChange={(url) => {
                      setFormImageUrl(url);
                      if (syncHeroAndFleet) {
                        setFormHeroImageUrl(url);
                      }
                    }}
                    aspectRatio="wide"
                    placeholder="https://example.com/car-photo.jpg"
                    required
                  />

                  {/* Additional Gallery Images for Details Page */}
                  <div className="pt-4 border-t border-slate-200">
                    <span className="block text-xs font-extrabold text-[#081A33] uppercase tracking-wider mb-2">
                      Gallery Images (for Vehicle Details Page)
                    </span>
                    <p className="text-xs text-slate-500 mb-3">
                      Add additional angle photos and interior shots to be displayed in the vehicle details gallery.
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Paste image URL (https://...)"
                        value={newGalleryUrlInput}
                        onChange={(e) => setNewGalleryUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddGalleryUrl();
                          }
                        }}
                        className="flex-1 min-w-[200px] px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F5B936]"
                      />
                      <button
                        type="button"
                        onClick={handleAddGalleryUrl}
                        className="px-4 py-2.5 rounded-xl bg-[#081A33] hover:bg-[#122D52] text-white text-xs font-bold cursor-pointer"
                      >
                        Add via URL
                      </button>
                      <label className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#081A33] text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0 border border-slate-200">
                        <Upload className="w-3.5 h-3.5 text-[#F5B936]" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const url = await DataStore.uploadImage(file);
                              if (url) {
                                setFormGalleryImages((prev) => [...prev, url]);
                                toast.success('Gallery photo uploaded');
                              }
                            } catch (err: any) {
                              toast.error(err?.message || 'Failed to upload gallery image');
                            }
                          }}
                        />
                      </label>
                    </div>

                    {/* Gallery Thumbnails List */}
                    {formGalleryImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {formGalleryImages.map((imgUrl, i) => (
                          <div
                            key={i}
                            className="relative group/thumb rounded-xl border border-slate-200 bg-slate-50 h-24 flex items-center justify-center overflow-hidden p-2"
                          >
                            <Image
                              src={imgUrl}
                              alt={`Gallery thumbnail ${i + 1}`}
                              fill
                              className="object-contain p-1"
                              sizes="120px"
                            />
                            {/* Actions on hover */}
                            <div className="absolute inset-0 bg-[#081A33]/70 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {formImageUrl !== imgUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormImageUrl(imgUrl);
                                    toast.success('Set as primary image');
                                  }}
                                  title="Set as Primary Image"
                                  className="p-1 rounded bg-[#F5B936] text-[#081A33] text-[10px] font-bold"
                                >
                                  Primary
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(i)}
                                title="Remove Image"
                                className="p-1 rounded bg-red-600 text-white text-[10px]"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  {activeTab !== 'images' ? (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs = ['basic', 'pricing', 'specs', 'amenities', 'images'] as const;
                        const curr = tabs.indexOf(activeTab);
                        if (curr < tabs.length - 1) setActiveTab(tabs[curr + 1]);
                      }}
                      className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-[#081A33] cursor-pointer"
                    >
                      Next Step &rarr;
                    </button>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-[#F5B936] hover:bg-[#E5A928] text-[#071A35] text-xs font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isSaving ? 'Saving Vehicle...' : editingCar ? 'Save Changes' : 'Publish Vehicle'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Delete Confirm Dialog */}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Vehicle from Fleet"
        itemName={deleteTarget?.name}
        description="This will remove its public card, details page, and booking associations."
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
