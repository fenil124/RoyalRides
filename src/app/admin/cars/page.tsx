'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { DataStore } from '@/lib/data-store';
import { Car } from '@/types';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';

const CANONICAL_HERO_SLOTS = [
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    defaultName: 'Ertiga',
    defaultImage: '/images/cars/ertiga-transparent.png',
    label: 'Position 1 (Initial Active)',
  },
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    defaultName: 'Innova',
    defaultImage: '/images/cars/innova-transparent.png',
    label: 'Position 2 (Supporting Right)',
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    defaultName: 'Swift Dzire',
    defaultImage: '/images/cars/swift-dzire-transparent.png',
    label: 'Position 3 (Supporting Left)',
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    defaultName: 'Urbania Traveller',
    defaultImage: '/images/cars/urbania-transparent.png',
    label: 'Position 4 (Far Supporting Right)',
  },
];

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingCarId, setLoadingCarId] = useState<string | null>(null);

  // Dedicated Hero Showcase Vehicle Edit Modal State
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [editingHeroCar, setEditingHeroCar] = useState<Car | null>(null);
  const [heroFormName, setHeroFormName] = useState('');
  const [heroFormImageUrl, setHeroFormImageUrl] = useState('');
  const [heroFormSyncFleet, setHeroFormSyncFleet] = useState(false);
  const [heroUploadedFile, setHeroUploadedFile] = useState<File | null>(null);
  const [heroImagePreviewUrl, setHeroImagePreviewUrl] = useState<string | null>(null);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [heroErrorMessage, setHeroErrorMessage] = useState<string | null>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Car | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // General Form state
  const [modalTab, setModalTab] = useState<'basic' | 'image'>('basic');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('MPV');
  const [formSeating, setFormSeating] = useState('7+1 Seating');
  const [formImageUrl, setFormImageUrl] = useState('/images/cars/innova-transparent.png');
  const [formHeroImageUrl, setFormHeroImageUrl] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formHeroFeatured, setFormHeroFeatured] = useState(true);

  // File upload state for general modal
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadCars = useCallback(async () => {
    const data = await DataStore.getCars();
    setCars(data);
  }, []);

  useEffect(() => {
    loadCars();

    const unsubscribe = DataStore.subscribe(() => {
      loadCars();
    });

    return () => {
      unsubscribe();
    };
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
      car_type:
        slot.defaultName === 'Urbania Traveller'
          ? 'Luxury Van'
          : slot.defaultName === 'Swift Dzire'
          ? 'Sedan'
          : 'MPV',
      seating_capacity:
        slot.defaultName === 'Urbania Traveller'
          ? '12+1 Seating'
          : slot.defaultName === 'Swift Dzire'
          ? '4+1 Seating'
          : slot.defaultName === 'Innova'
          ? '7+1 Seating'
          : '6+1 Seating',
      image_url: slot.defaultImage,
      hero_image_url: slot.defaultImage,
      is_active: true,
      is_hero_featured: true,
      display_order: 1,
    };
  };

  const handleOpenAdd = () => {
    setEditingCar(null);
    setFormName('');
    setFormType('MPV');
    setFormSeating('7+1 Seating');
    setFormImageUrl('/images/cars/innova-transparent.png');
    setFormHeroImageUrl('');
    setFormActive(true);
    setFormHeroFeatured(true);
    setUploadedFile(null);
    setImagePreviewUrl(null);
    setErrorMessage(null);
    setModalTab('basic');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (car: Car) => {
    setEditingCar(car);
    setFormName(car.name);
    setFormType(car.car_type);
    setFormSeating(car.seating_capacity);
    setFormImageUrl(car.image_url);
    setFormHeroImageUrl(car.hero_image_url || '');
    setFormActive(car.is_active);
    setFormHeroFeatured(car.is_hero_featured);
    setUploadedFile(null);
    setImagePreviewUrl(null);
    setErrorMessage(null);
    setModalTab('basic');
    setIsModalOpen(true);
  };

  // Open Hero-specific edit modal
  const handleOpenHeroEdit = (car: Car) => {
    setEditingHeroCar(car);
    setHeroFormName(car.name);
    setHeroFormImageUrl(car.hero_image_url || car.image_url);
    setHeroFormSyncFleet(false);
    setHeroUploadedFile(null);
    setHeroImagePreviewUrl(null);
    setHeroErrorMessage(null);
    setIsHeroModalOpen(true);
  };

  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeroErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setHeroErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setHeroErrorMessage('Image size exceeds 5 MB. Please choose a smaller file.');
      return;
    }

    setHeroUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setHeroImagePreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHeroCar) return;

    if (!heroFormName.trim()) {
      setHeroErrorMessage('Car name is required');
      return;
    }

    setIsSavingHero(true);
    setHeroErrorMessage(null);

    try {
      let finalHeroImageUrl = heroFormImageUrl;

      if (heroUploadedFile) {
        const uploadedUrl = await DataStore.uploadImage(heroUploadedFile);
        if (uploadedUrl) {
          finalHeroImageUrl = uploadedUrl;
        } else if (heroImagePreviewUrl) {
          finalHeroImageUrl = heroImagePreviewUrl;
        } else {
          throw new Error('Image upload failed.');
        }
      }

      if (!finalHeroImageUrl) {
        throw new Error('Please upload an image or provide an image URL');
      }

      await DataStore.saveCar({
        ...editingHeroCar,
        name: heroFormName.trim(),
        hero_image_url: finalHeroImageUrl,
        image_url: heroFormSyncFleet ? finalHeroImageUrl : editingHeroCar.image_url,
      });

      toast.success(`Hero vehicle "${heroFormName.trim()}" updated successfully!`);
      setIsHeroModalOpen(false);
      setEditingHeroCar(null);
      await loadCars();
    } catch (err: any) {
      console.error('Error saving hero vehicle:', err);
      const msg = err?.message || 'Failed to update hero vehicle.';
      setHeroErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSavingHero(false);
    }
  };

  // Direct active/inactive status toggle without opening edit dialog
  const handleToggleCarActive = async (car: Car) => {
    if (loadingCarId) return;
    setLoadingCarId(car.id);

    const newActiveState = !car.is_active;
    try {
      await DataStore.saveCar({
        ...car,
        is_active: newActiveState,
      });
      setCars((prev) =>
        prev.map((c) => (c.id === car.id ? { ...c, is_active: newActiveState } : c))
      );
      toast.success(
        `${car.name} marked as ${newActiveState ? 'Active' : 'Inactive'}`
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update vehicle status');
    } finally {
      setLoadingCarId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMessage('Image size exceeds 5 MB. Please choose a smaller file.');
      return;
    }

    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMessage('Car name is required');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      let finalImageUrl = formImageUrl;

      if (uploadedFile) {
        const remoteUrl = await DataStore.uploadImage(uploadedFile);
        if (remoteUrl) {
          finalImageUrl = remoteUrl;
        } else if (imagePreviewUrl) {
          finalImageUrl = imagePreviewUrl;
        }
      }

      await DataStore.saveCar({
        id: editingCar ? editingCar.id : undefined,
        name: formName.trim(),
        car_type: formType,
        seating_capacity: formSeating,
        image_url: finalImageUrl,
        hero_image_url: formHeroImageUrl || undefined,
        is_active: formActive,
        is_hero_featured: formHeroFeatured,
      });

      toast.success(editingCar ? 'Vehicle updated successfully' : 'New vehicle added to fleet');
      setIsModalOpen(false);
      loadCars();
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
      console.error('Delete error:', err);
      toast.error(err?.message || 'Failed to delete vehicle');
    } finally {
      setIsDeleting(false);
    }
  };

  const allCount = cars.length;
  const activeCount = cars.filter((c) => c.is_active).length;
  const inactiveCount = cars.filter((c) => !c.is_active).length;

  const filteredCars = cars.filter((c) => {
    if (statusFilter === 'Active' && !c.is_active) return false;
    if (statusFilter === 'Inactive' && c.is_active) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.car_type.toLowerCase().includes(q) ||
        c.seating_capacity.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2C50] tracking-tight">
            Cars &amp; Fleet Management
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Manage your fleet of chauffeur vehicles, hero animation stage cars, and availability.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B2C50] text-white text-xs font-bold hover:bg-[#071B30] transition-colors self-start sm:self-auto shadow-sm cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Car</span>
        </button>
      </div>

      {/* 1. Hero Animation Showcase Cars Section */}
      <div className="bg-gradient-to-br from-[#071A35] to-[#0A254A] rounded-2xl p-5 sm:p-6 text-white border border-[#1E3A5F] shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F5B936]/20 border border-[#F5B936]/40 flex items-center justify-center text-[#F5B936]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Hero Animation Showcase Vehicles
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#F5B936] text-[#071A35]">
                  Homepage 2.5s Stage
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Manage the names and transparent cutout images displayed in the rotating hero animation on the homepage.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Hero Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CANONICAL_HERO_SLOTS.map((slot) => {
            const car = getHeroCar(slot);
            const currentImg = car.hero_image_url || car.image_url || slot.defaultImage;

            return (
              <div
                key={slot.id}
                className="bg-[#051428]/85 rounded-xl p-4 border border-white/10 hover:border-[#F5B936]/50 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  {/* Position label & vehicle type */}
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="text-[#F5B936] font-bold">
                      {slot.label}
                    </span>
                    <span className="text-slate-400 font-medium">{car.car_type}</span>
                  </div>

                  {/* Dark Navy Stage Preview Container */}
                  <div className="relative w-full h-32 rounded-lg bg-[#071A35] border border-white/10 overflow-hidden flex items-center justify-center p-2 mb-3">
                    <div className="absolute bottom-1 w-3/4 h-6 rounded-[100%] border border-[#F5B936]/30 pointer-events-none" />
                    <Image
                      src={currentImg}
                      alt={car.name}
                      fill
                      unoptimized={Boolean(currentImg?.startsWith('data:') || currentImg?.startsWith('http'))}
                      className="object-contain p-1"
                      sizes="(max-width: 640px) 100vw, 25vw"
                    />
                  </div>

                  {/* Car Name */}
                  <h3 className="text-sm font-bold text-white truncate mb-1">
                    {car.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 block truncate mb-3">
                    {car.seating_capacity}
                  </span>
                </div>

                {/* Edit Hero Image & Name Button */}
                <button
                  type="button"
                  onClick={() => handleOpenHeroEdit(car)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#F5B936] hover:bg-[#E5A928] text-[#071A35] text-xs font-bold transition-colors cursor-pointer shadow-sm active:scale-95"
                >
                  <Edit className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Edit Hero Image &amp; Name</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Filter Tabs & Search Bar for Fleet */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E2E8F0] rounded-xl self-start shadow-2xs">
          <button
            type="button"
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'All'
                ? 'bg-[#0B2C50] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0B2C50]'
            }`}
          >
            All Fleet ({allCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'Active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0B2C50]'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'Inactive'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0B2C50]'
            }`}
          >
            Inactive ({inactiveCount})
          </button>
        </div>

        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search car by name or type..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50] shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Responsive Grid of Cars with consistent heights */}
      {filteredCars.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] text-xs text-[#64748B]">
          No vehicles found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCars.map((car) => (
            <div
              key={car.id}
              className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Image Preview Container */}
                <div className="relative w-full h-40 bg-slate-50/80 rounded-xl mb-3 overflow-hidden flex items-center justify-center p-3 border border-slate-100">
                  <Image
                    src={car.image_url || '/images/cars/innova-transparent.png'}
                    alt={car.name}
                    fill
                    unoptimized={Boolean((car.image_url || '')?.startsWith('data:') || (car.image_url || '')?.startsWith('http'))}
                    className="object-contain p-2"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                {/* Title & Type */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-base font-bold text-[#14243A] truncate">
                    {car.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-[#14243A]">
                    {car.car_type}
                  </span>
                </div>

                {/* Seating */}
                <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-3">
                  <Users className="w-3.5 h-3.5" />
                  <span>{car.seating_capacity}</span>
                </div>

                {/* Badges: Direct Active Toggle & Hero Featured */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => handleToggleCarActive(car)}
                    disabled={loadingCarId === car.id}
                    title="Click to toggle availability"
                    className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer shadow-2xs hover:opacity-85 active:scale-95 ${
                      car.is_active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {loadingCarId === car.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Power className="w-2.5 h-2.5" />
                    )}
                    <span>{car.is_active ? 'Active' : 'Inactive'}</span>
                  </button>

                  {car.is_hero_featured && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      Hero Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Actions: Edit & Delete buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(car)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#14243A] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(car)}
                  className="inline-flex items-center justify-center p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title={`Delete ${car.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dedicated Hero Showcase Vehicle Edit Modal */}
      {isHeroModalOpen && editingHeroCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => !isSavingHero && setIsHeroModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-[#E2E8F0] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F5B936]/20 flex items-center justify-center text-[#D99A1C]">
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0B2C50]">
                    Edit Hero Vehicle: {editingHeroCar.name}
                  </h2>
                  <p className="text-[11px] text-[#64748B]">
                    Homepage 2.5s rotating hero animation stage
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSavingHero}
                onClick={() => setIsHeroModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {heroErrorMessage && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{heroErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveHero} className="py-4 space-y-4">
              {/* 1. Change Car Name */}
              <div>
                <label className="block text-xs font-bold text-[#14243A] mb-1">
                  Hero Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={heroFormName}
                  onChange={(e) => setHeroFormName(e.target.value)}
                  placeholder="e.g. Swift Dzire, Innova, Ertiga"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                />
                <span className="text-[11px] text-[#64748B] mt-1 block">
                  Displayed below the vehicle and in the hero rotating indicators.
                </span>
              </div>

              {/* 2. Upload Replacement Car Image */}
              <div>
                <label className="block text-xs font-bold text-[#14243A] mb-1.5">
                  Upload Replacement Cutout Image
                </label>
                <input
                  ref={heroFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleHeroFileChange}
                  className="hidden"
                />

                <div
                  onClick={() => heroFileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E2E8F0] hover:border-[#0B2C50] rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-50/70"
                >
                  <Upload className="w-7 h-7 text-[#0B2C50] mx-auto mb-1.5" />
                  <span className="text-xs font-bold text-[#14243A] block">
                    {heroUploadedFile ? heroUploadedFile.name : 'Choose file to replace hero image'}
                  </span>
                  <span className="text-[11px] text-[#64748B] mt-0.5 block">
                    Transparent PNG cutout strongly recommended (Max 5 MB)
                  </span>
                </div>
              </div>

              {/* 3. Alternatively Paste Image URL */}
              <div>
                <label className="block text-xs font-bold text-[#14243A] mb-1">
                  Or Paste Image URL / Path
                </label>
                <input
                  type="text"
                  value={heroFormImageUrl}
                  onChange={(e) => {
                    setHeroFormImageUrl(e.target.value);
                    if (heroUploadedFile) setHeroUploadedFile(null);
                    if (heroImagePreviewUrl) setHeroImagePreviewUrl(null);
                  }}
                  placeholder="/images/cars/swift-dzire-transparent.png"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                />
              </div>

              {/* 4. Preview the selected image before saving */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#14243A]">
                    Hero Stage Live Preview
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Dark stage simulation
                  </span>
                </div>
                <div className="relative w-full h-44 rounded-xl overflow-hidden bg-[#071A35] border border-slate-700 flex items-center justify-center p-3">
                  <div className="absolute bottom-2 w-4/5 h-8 rounded-[100%] border border-[#F5B936]/40 shadow-[0_0_15px_#F5B936] pointer-events-none" />

                  {heroImagePreviewUrl || heroFormImageUrl ? (
                    <Image
                      src={heroImagePreviewUrl || heroFormImageUrl}
                      alt="Hero vehicle preview"
                      fill
                      unoptimized={Boolean(
                        (heroImagePreviewUrl || heroFormImageUrl)?.startsWith('data:') ||
                          (heroImagePreviewUrl || heroFormImageUrl)?.startsWith('http')
                      )}
                      className="object-contain p-2 z-10"
                      sizes="(max-width: 640px) 100vw, 400px"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">No image selected</span>
                  )}
                </div>
              </div>

              {/* 5. Fleet Card Image Sync Checkbox */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#14243A] block">
                    Also apply to Fleet card image
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    Keep unchecked to manage hero image independently
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={heroFormSyncFleet}
                  onChange={(e) => setHeroFormSyncFleet(e.target.checked)}
                  className="w-4 h-4 text-[#0B2C50] rounded cursor-pointer"
                />
              </div>

              {/* 6. Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSavingHero}
                  onClick={() => setIsHeroModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingHero}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-[#0B2C50] text-white text-xs font-bold hover:bg-[#071B30] transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSavingHero && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSavingHero ? 'Saving to Database...' : 'Save Hero Vehicle'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* General Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => !isSaving && setIsModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-[#E2E8F0] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-[#0B2C50]">
                {editingCar ? `Edit ${editingCar.name}` : 'Add New Car to Fleet'}
              </h2>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 pt-3 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setModalTab('basic')}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  modalTab === 'basic'
                    ? 'border-[#0B2C50] text-[#0B2C50]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Vehicle Specs
              </button>
              <button
                type="button"
                onClick={() => setModalTab('image')}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  modalTab === 'image'
                    ? 'border-[#0B2C50] text-[#0B2C50]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Photo &amp; Image
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="py-4 space-y-4">
              {modalTab === 'basic' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#14243A] mb-1">
                      Vehicle Model Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Innova Hycross"
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Category Type
                      </label>
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      >
                        <option value="MPV">MPV</option>
                        <option value="Sedan">Sedan</option>
                        <option value="SUV">SUV</option>
                        <option value="Luxury Van">Luxury Van</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Seating Capacity
                      </label>
                      <input
                        type="text"
                        value={formSeating}
                        onChange={(e) => setFormSeating(e.target.value)}
                        placeholder="e.g. 7+1 Seating"
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#14243A] block">
                        Active in Booking &amp; Fleet
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        Display vehicle on public website
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formActive}
                      onChange={(e) => setFormActive(e.target.checked)}
                      className="w-4 h-4 text-[#0B2C50] rounded cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-[#14243A] block">
                        Featured in Hero Showcase
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        Include in the continuous 2.5s homepage carousel
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formHeroFeatured}
                      onChange={(e) => setFormHeroFeatured(e.target.checked)}
                      className="w-4 h-4 text-[#0B2C50] rounded cursor-pointer"
                    />
                  </div>
                </>
              )}

              {modalTab === 'image' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#14243A] mb-2">
                      Upload Vehicle Photo
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#E2E8F0] hover:border-[#0B2C50] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/60"
                    >
                      <Upload className="w-8 h-8 text-[#0B2C50] mx-auto mb-2" />
                      <span className="text-xs font-bold text-[#14243A] block">
                        Click to upload new photo
                      </span>
                      <span className="text-[11px] text-[#64748B] mt-0.5 block">
                        PNG transparent cutout recommended (Max 5 MB)
                      </span>
                    </div>
                  </div>

                  {/* Preview Container */}
                  <div>
                    <label className="block text-xs font-bold text-[#14243A] mb-1.5">
                      Current / Preview Image
                    </label>
                    <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center p-3">
                      <Image
                        src={imagePreviewUrl || formImageUrl}
                        alt="Vehicle preview"
                        fill
                        unoptimized={Boolean(
                          (imagePreviewUrl || formImageUrl)?.startsWith('data:') ||
                            (imagePreviewUrl || formImageUrl)?.startsWith('http')
                        )}
                        className="object-contain"
                        sizes="(max-width: 640px) 100vw, 400px"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#14243A] mb-1">
                      Or Image URL / Path
                    </label>
                    <input
                      type="text"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="/images/cars/innova-transparent.png"
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-[#14243A] mb-1">
                      Hero Cutout Image URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={formHeroImageUrl}
                      onChange={(e) => setFormHeroImageUrl(e.target.value)}
                      placeholder="/images/cars/innova-transparent.png"
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                    />
                    <span className="text-[11px] text-[#64748B] mt-1 block">
                      Leave empty to use main image for hero showcase.
                    </span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-[#0B2C50] text-white text-xs font-bold hover:bg-[#071B30] transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? 'Saving...' : 'Save Vehicle'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this vehicle?"
        itemName={deleteTarget ? deleteTarget.name : undefined}
        description="This vehicle will be removed from your active fleet and booking options. Booking history records will be preserved."
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
