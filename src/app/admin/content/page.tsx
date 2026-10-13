'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Edit, Save, CheckCircle2, X } from 'lucide-react';
import { DataStore } from '@/lib/data-store';
import { HomepageSection } from '@/types';

export default function AdminContentPage() {
  const [content, setContent] = useState<Record<string, HomepageSection>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const loadContent = useCallback(async () => {
    const data = await DataStore.getHomepageContent();
    setContent(data);
  }, []);

  useEffect(() => {
    loadContent();
    const unsubscribe = DataStore.subscribe(() => {
      loadContent();
    });
    return () => {
      unsubscribe();
    };
  }, [loadContent]);

  const handleOpenEdit = (key: string) => {
    const section = content[key];
    setEditingKey(key);
    setFormTitle(section?.title || '');
    setFormSubtitle(section?.subtitle || '');
    setFormBadge(section?.badge || '');
    setFormBody(section?.body || '');
    setFormImageUrl(section?.image_url || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey || isSaving) return;

    setIsSaving(true);
    try {
      await DataStore.saveHomepageContent(editingKey, {
        title: formTitle,
        subtitle: formSubtitle,
        badge: formBadge,
        body: formBody,
        image_url: formImageUrl || null,
      });

      setEditingKey(null);
      loadContent();
    } finally {
      setIsSaving(false);
    }
  };

  const sectionsList = [
    {
      key: 'hero',
      name: 'Hero Section',
      desc: 'Update headline, subtitle, badge and background image',
      thumbnail: content['hero']?.image_url || '/images/hero-bg.jpg',
    },
    {
      key: 'features',
      name: 'Features Section',
      desc: 'Update agency guarantees and promise highlights',
      thumbnail: null,
    },
    {
      key: 'about',
      name: 'About Section',
      desc: 'Update company bio, standards, and safety description',
      thumbnail: null,
    },
    {
      key: 'contact',
      name: 'Contact Information & Callout',
      desc: 'Update customer callout headlines and service hours',
      thumbnail: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header matching panel 9 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B50] tracking-tight">
          Home Page Content
        </h1>
        <p className="text-xs sm:text-sm text-[#667085] mt-1">
          Manage your website copywriting, slogans, and featured sections dynamically.
        </p>
      </div>

      {/* Sections List matching panel 9 */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] divide-y divide-[#E4E7EC] overflow-hidden shadow-2xs">
        {sectionsList.map((sec) => {
          const item = content[sec.key];
          return (
            <div key={sec.key} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-4">
                {sec.thumbnail && (
                  <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                    <Image
                      src={sec.thumbnail}
                      alt={sec.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-[#082B50]">{sec.name}</h3>
                  <p className="text-xs text-[#667085] mt-0.5">{sec.desc}</p>
                  {item?.title && (
                    <p className="text-xs text-slate-500 font-medium mt-1 truncate max-w-md">
                      Current: &ldquo;{item.title}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleOpenEdit(sec.key)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-white hover:border-[#082B50] hover:text-[#082B50] transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Edit Content Modal */}
      {editingKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#082B50]">
                Edit {editingKey.toUpperCase()} Content
              </h3>
              <button
                onClick={() => setEditingKey(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1">
                  Tag / Badge (Uppercase)
                </label>
                <input
                  type="text"
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  placeholder="e.g. PREMIUM CHAUFFEUR DRIVEN CAR RENTAL"
                  className="w-full px-3 py-2 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1">
                  Main Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Comfortable Rides for Every Journey"
                  className="w-full px-3 py-2 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="e.g. Airport Transfers, Outstation Trips, City Travel and More"
                  className="w-full px-3 py-2 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1">
                  Body Description
                </label>
                <textarea
                  rows={3}
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  placeholder="Extended description or details"
                  className="w-full px-3 py-2 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
                />
              </div>

              {editingKey === 'hero' && (
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1">
                    Hero Background Image Path
                  </label>
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="/images/hero-bg.jpg"
                    className="w-full px-3 py-2 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setEditingKey(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#082B50] text-white text-xs font-bold hover:bg-[#071A2D] cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isSaving ? 'Saving...' : 'Save Content'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
