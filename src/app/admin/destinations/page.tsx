'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Plus, Edit, Trash2, X, AlertCircle, Loader2, Upload, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { DataStore } from '@/lib/data-store';
import { Destination } from '@/types';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<Destination | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingDestId, setLoadingDestId] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Destination | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('/images/destinations/mumbai.jpg');
  const [formPublished, setFormPublished] = useState(true);

  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDestinations = useCallback(async () => {
    const data = await DataStore.getDestinations();
    setDestinations(data);
  }, []);

  useEffect(() => {
    loadDestinations();

    const unsubscribe = DataStore.subscribe(() => {
      loadDestinations();
    });

    return () => {
      unsubscribe();
    };
  }, [loadDestinations]);

  const handleOpenAdd = () => {
    setEditingDest(null);
    setFormName('');
    setFormDescription('');
    setFormImageUrl('/images/destinations/mumbai.jpg');
    setFormPublished(true);
    setUploadedFile(null);
    setImagePreviewUrl(null);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dest: Destination) => {
    setEditingDest(dest);
    setFormName(dest.name);
    setFormDescription(dest.description || '');
    setFormImageUrl(dest.image_url);
    setFormPublished(dest.is_published);
    setUploadedFile(null);
    setImagePreviewUrl(null);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  // Direct publish / unpublish toggle on each card
  const handleTogglePublish = async (dest: Destination) => {
    if (loadingDestId) return;
    setLoadingDestId(dest.id);

    const newPublishedState = !dest.is_published;
    try {
      await DataStore.saveDestination({
        ...dest,
        is_published: newPublishedState,
      });
      setDestinations((prev) =>
        prev.map((d) => (d.id === dest.id ? { ...d, is_published: newPublishedState } : d))
      );
      toast.success(
        `${dest.name} marked as ${newPublishedState ? 'Published' : 'Draft'}`
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update destination status');
    } finally {
      setLoadingDestId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 5 MB limit.');
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
      setErrorMessage('Destination name is required');
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

      await DataStore.saveDestination({
        id: editingDest ? editingDest.id : undefined,
        name: formName.trim(),
        description: formDescription.trim(),
        image_url: finalImageUrl,
        is_published: formPublished,
      });

      toast.success(editingDest ? 'Destination updated' : 'New destination added');
      setIsModalOpen(false);
      loadDestinations();
    } catch (err: any) {
      const msg = err?.message || 'Failed to save destination.';
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
      await DataStore.deleteDestination(deleteTarget.id);
      toast.success(`${deleteTarget.name} destination deleted`);
      setDeleteTarget(null);
      loadDestinations();
    } catch (err: any) {
      console.error('Delete destination error:', err);
      toast.error(err?.message || 'Failed to delete destination');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2C50] tracking-tight">
            Destinations
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Manage showcased road travel destinations, scenery photography, and publication states.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B2C50] text-white text-xs font-bold hover:bg-[#071B30] transition-colors self-start sm:self-auto shadow-sm cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Destination</span>
        </button>
      </div>

      {/* Grid of Destination Cards */}
      {destinations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] text-xs text-[#64748B]">
          No destinations configured yet. Click &ldquo;Add Destination&rdquo; to create your first card.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Image Container with Consistent Ratio */}
                <div className="relative w-full h-44 rounded-xl overflow-hidden mb-3 bg-slate-100 border border-slate-100">
                  <Image
                    src={dest.image_url}
                    alt={dest.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {/* Direct toggle publish badge */}
                  <div className="absolute top-2.5 right-2.5">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(dest)}
                      disabled={loadingDestId === dest.id}
                      title="Click to toggle publication"
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs transition-all cursor-pointer hover:opacity-90 active:scale-95 ${
                        dest.is_published
                          ? 'bg-emerald-600/90 text-white'
                          : 'bg-slate-800/90 text-slate-200'
                      }`}
                    >
                      {loadingDestId === dest.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : dest.is_published ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                      <span>{dest.is_published ? 'Published' : 'Draft'}</span>
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-bold text-[#14243A] mb-1">
                  {dest.name}
                </h3>
                <p className="text-xs text-[#64748B] line-clamp-2 mb-3">
                  {dest.description || 'Chauffeur services available.'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(dest)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#14243A] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(dest)}
                  className="inline-flex items-center justify-center p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title={`Delete ${dest.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => !isSaving && setIsModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-[#E2E8F0] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-[#0B2C50]">
                {editingDest ? `Edit ${editingDest.name}` : 'Add Destination'}
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

            {errorMessage && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#14243A] mb-1">
                  Destination Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14243A] mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Financial capital, Marine Drive & Gateway of India."
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14243A] mb-1">
                  Upload Destination Image
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
                  className="border-2 border-dashed border-[#E2E8F0] hover:border-[#0B2C50] rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/60 mb-2"
                >
                  <Upload className="w-6 h-6 text-[#0B2C50] mx-auto mb-1" />
                  <span className="text-xs font-bold text-[#14243A] block">
                    Choose photo file (Max 5 MB)
                  </span>
                </div>

                <div className="relative w-full h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <Image
                    src={imagePreviewUrl || formImageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14243A] mb-1">
                  Image Path / URL
                </label>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="/images/destinations/mumbai.jpg"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#14243A] block">
                    Published
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    Visible on public Destinations section
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formPublished}
                  onChange={(e) => setFormPublished(e.target.checked)}
                  className="w-4 h-4 text-[#0B2C50] rounded cursor-pointer"
                />
              </div>

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
                  <span>{isSaving ? 'Saving...' : 'Save Destination'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete destination?"
        itemName={deleteTarget ? deleteTarget.name : undefined}
        description="This will remove the destination from your travel showcase. Related routes are not affected."
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
