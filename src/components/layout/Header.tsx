'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/common/Logo';

interface HeaderProps {
  onOpenInquiry?: () => void;
}

export function Header({ onOpenInquiry }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About Us', href: '#about' },
    { label: 'Our Fleet', href: '#fleet' },
    { label: 'Popular Routes', href: '#routes' },
    { label: 'Destinations', href: '#destinations' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 select-none ${
        isScrolled
          ? 'bg-[#071A35]/95 backdrop-blur-md border-b border-white/10 shadow-xl py-3'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo on the left */}
          <Link href="/" className="flex items-center group">
            <Logo variant="dark" size="sm" />
          </Link>

          {/* Navigation links in the center */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-white/90">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-[#F5B936] transition-colors py-1 text-slate-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Gold 'Book Now' button on the right */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenInquiry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F5B936] hover:bg-[#E5A928] text-[#071A35] text-xs font-extrabold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <span>Book Now</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={onOpenInquiry}
              className="sm:hidden px-3.5 py-1.5 rounded-full bg-[#F5B936] text-[#071A35] text-[11px] font-extrabold"
            >
              Book Now
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#071A35]/98 backdrop-blur-xl border-b border-white/10 px-6 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2 text-sm font-semibold text-white">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-slate-200 hover:text-[#F5B936] border-b border-white/5 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenInquiry) onOpenInquiry();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#F5B936] hover:bg-[#E5A928] text-[#071A35] text-xs font-extrabold shadow-lg transition-all"
            >
              <span>Book Now</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
