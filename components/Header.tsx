"use client";

import { useState, useEffect } from "react";
import type { JSX } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ButtonSignin from "./ButtonSignin";
import Logo from "./Logo";
import config from "@/config";

const links: {
  href: string;
  label: string;
}[] = [
  {
    href: "/#platform",
    label: "Platform",
  },
  {
    href: "/#features",
    label: "Features",
  },
  {
    href: "/#use-cases",
    label: "Use Cases",
  },
  {
    href: "/#pricing",
    label: "Pricing",
  },
  {
    href: "/#testimonials",
    label: "Testimonials",
  },
];

// Modern Navigation Bar with Magic UI and 21st.dev components
const Header = () => {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Handle scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'backdrop-blur-md bg-white/70 border-b border-white/20 shadow-lg' 
          : 'backdrop-blur-sm bg-white/50'
      }`}
    >
      <nav className="max-w-full mx-auto px-[5%] h-20 md:h-20 flex items-center justify-between">
        
        {/* Left: Logo with Magic UI Blur Fade entrance animation */}
        <div className="animate-fade-in">
          <Link
            className="flex items-center shrink-0 group transition-transform duration-300 hover:scale-105"
            href="/"
            title={`${config.appName} homepage`}
          >
            <Logo className="group-hover:scale-105 transition-transform duration-300" />
          </Link>
        </div>

        {/* Center: Navigation links with 21st.dev hover animations (Desktop) */}
        <ul className="hidden lg:flex items-center justify-center gap-8 absolute left-1/2 transform -translate-x-1/2">
          {links.map((link) => (
            <li key={link.href} className="group">
              <Link
                href={link.href}
                className="relative body-medium text-text-secondary hover:text-brand-blue 
                         transition-colors duration-300 py-2 px-1"
              >
                {link.label}
                {/* 21st.dev style hover underline animation */}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-blue 
                               group-hover:w-full transition-all duration-300 ease-out"></span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Right: CTA button with Magic UI Shine Border effect */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="#start-trial"
            className="relative inline-flex items-center justify-center px-6 py-3 text-sm font-semibold 
                     bg-brand-blue text-white rounded-lg shadow-md hover:shadow-lg
                     transform hover:scale-105 transition-all duration-300 
                     border border-transparent hover:border-brand-blue/20
                     overflow-hidden group"
          >
            <span className="relative z-10">Start Free Trial</span>
            {/* Magic UI Shine Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                          -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </Link>
        </div>

        {/* Mobile menu button with Magic UI animations */}
        <div className="lg:hidden">
          <button
            type="button"
            className={`relative w-10 h-10 flex items-center justify-center rounded-lg 
                      transition-all duration-300 ${
                        isOpen 
                          ? 'bg-brand-blue/10 text-brand-blue' 
                          : 'hover:bg-gray-100 text-text-secondary'
                      }`}
            aria-expanded="false"
            aria-label="Toggle navigation"
            onClick={() => setIsOpen(!isOpen)}
          >
            {/* Animated hamburger to X */}
            <div className="relative w-5 h-5">
              <span className={`absolute block w-5 h-0.5 bg-current transform transition-all duration-300 ${
                isOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'
              }`}></span>
              <span className={`absolute block w-5 h-0.5 bg-current transition-all duration-300 ${
                isOpen ? 'opacity-0' : 'opacity-100'
              }`}></span>
              <span className={`absolute block w-5 h-0.5 bg-current transform transition-all duration-300 ${
                isOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'
              }`}></span>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Menu with Magic UI Dock style */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="backdrop-blur-md bg-white/90 border-t border-white/20 px-[5%] py-6">
          <ul className="space-y-4">
            {links.map((link, index) => (
              <li 
                key={link.href}
                className={`transform transition-all duration-300 delay-${index * 50} ${
                  isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
              >
                <Link
                  href={link.href}
                  className="block body-large text-text-secondary hover:text-brand-blue 
                           transition-colors duration-300 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {/* Mobile CTA */}
            <li className={`pt-4 transform transition-all duration-300 delay-300 ${
              isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <Link
                href="#start-trial"
                className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-semibold 
                         bg-brand-blue text-white rounded-lg shadow-md hover:shadow-lg
                         transform hover:scale-105 transition-all duration-300"
                onClick={() => setIsOpen(false)}
              >
                Start Free Trial
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
