"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import {
  Search,
  Globe2,
  ArrowRight,
  ArrowUpRight,
  X,
  MapPin,
  Zap,
  ChevronDown,
  Layers,
} from "lucide-react";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function isValidCountry(code: string): boolean {
  if (!code || code.length !== 2) return false;
  return true;
}

// Intersection Observer hook for reveal animations
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "-30px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, isVisible } = useReveal();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

type CountryData = {
  _id?: string;
  code: string;
  name: string;
  flagEmoji: string;
  minPrice?: number;
  packageCount?: number;
  popular?: boolean;
  region: string;
};

export default function DestinationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  const countries = useQuery(api.packages.getCountries);

  // Track mouse for subtle parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left - rect.width / 2) / rect.width,
          y: (e.clientY - rect.top - rect.height / 2) / rect.height,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const individualCountries = useMemo(() => {
    const data: CountryData[] = countries && countries.length > 0 ? countries : [];
    const validCountries = data.filter((country) => isValidCountry(country.code));
    validCountries.sort((a, b) => a.name.localeCompare(b.name));
    return validCountries;
  }, [countries]);

  const regions = useMemo(() => {
    const uniqueRegions = new Set<string>();
    individualCountries.forEach((country) => {
      if (country.region) {
        uniqueRegions.add(country.region);
      }
    });

    const sortedRegions = Array.from(uniqueRegions).sort();
    return [
      { id: "all", label: "All Regions" },
      ...sortedRegions.map((region) => ({ id: region, label: region })),
    ];
  }, [individualCountries]);

  const displayCountries = useMemo(() => {
    return individualCountries.filter((country) => {
      const matchesSearch = country.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = selectedRegion === "all" || country.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [individualCountries, searchQuery, selectedRegion]);

  const popularCountries = useMemo(() => {
    return individualCountries.filter((c) => c.popular).slice(0, 8);
  }, [individualCountries]);

  const isLoading = countries === undefined;

  return (
    <div className="overflow-hidden">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section
        ref={heroRef}
        className="relative min-h-[70vh] flex flex-col justify-center pt-24 pb-16"
      >
        {/* Subtle grid texture */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(90deg, var(--simlak-dark) 1px, transparent 1px),
                linear-gradient(var(--simlak-dark) 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px",
            }}
          />
        </div>

        {/* Gradient orbs with mouse parallax */}
        <div
          className="absolute top-20 -left-32 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] pointer-events-none transition-transform duration-1000 ease-out"
          style={{
            background: "var(--simlak-teal)",
            transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`,
          }}
        />
        <div
          className="absolute bottom-0 -right-32 w-[600px] h-[600px] rounded-full opacity-15 blur-[120px] pointer-events-none transition-transform duration-1000 ease-out"
          style={{
            background: "var(--simlak-orange)",
            transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`,
          }}
        />

        <div className="container-wide relative z-10">
          {/* Eyebrow */}
          <div className="mb-8 overflow-hidden">
            <div
              className="flex items-center gap-4 animate-slide-up"
              style={{ animationDelay: "100ms" }}
            >
              <div className="h-px w-12 bg-[var(--simlak-teal)]" />
              <span className="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                200+ Destinations
              </span>
            </div>
          </div>

          {/* Giant headline */}
          <div className="max-w-4xl mb-12">
            <h1 className="leading-[0.9] tracking-[-0.04em]">
              <span
                className="block text-[clamp(3rem,10vw,8rem)] font-black animate-slide-up"
                style={{ animationDelay: "200ms" }}
              >
                Where are you
              </span>
              <span
                className="block text-[clamp(3rem,10vw,8rem)] font-black text-[var(--simlak-orange)] animate-slide-up"
                style={{ animationDelay: "300ms" }}
              >
                heading?
              </span>
            </h1>
          </div>

          {/* Search Bar */}
          <div
            className="max-w-2xl animate-slide-up"
            style={{ animationDelay: "400ms" }}
          >
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search any country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-18 pl-16 pr-16 text-xl bg-card border-2 border-border rounded-2xl shadow-lg focus:border-[var(--simlak-orange)] focus:outline-none transition-all py-5"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Quick suggestions */}
            {!searchQuery && popularCountries.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <span className="text-sm text-muted-foreground">Popular:</span>
                {popularCountries.slice(0, 5).map((country) => (
                  <button
                    key={country.code}
                    onClick={() => setSearchQuery(country.name)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm font-medium hover:border-[var(--simlak-orange)] hover:text-[var(--simlak-orange)] transition-all"
                  >
                    <span className="text-lg">{country.flagEmoji}</span>
                    <span>{country.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <span className="text-sm font-medium">Explore destinations</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>
      </section>

      {/* ============================================
          POPULAR DESTINATIONS - Horizontal scroll
          ============================================ */}
      {popularCountries.length > 0 && (
        <section className="py-20 bg-[var(--simlak-dark)] text-white overflow-hidden">
          <div className="container-wide mb-10">
            <Reveal>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <span className="text-[var(--simlak-orange)] text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">
                    Most Popular
                  </span>
                  <h2 className="text-4xl md:text-5xl font-bold">
                    Trending <span className="text-[var(--simlak-teal)]">destinations</span>
                  </h2>
                </div>
                <Link
                  href="/bundles"
                  className="group flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                  <span className="font-medium">View regional bundles</span>
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Horizontal scroll container */}
          <div className="relative">
            <div className="flex gap-5 px-6 md:px-12 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide">
              {popularCountries.map((country, index) => (
                <Link
                  key={country.code}
                  href={`/destinations/${country.code.toLowerCase()}`}
                  className="group flex-shrink-0 snap-start"
                >
                  <div
                    className="relative w-[280px] md:w-[320px] h-[400px] rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02]"
                    style={{
                      background: `linear-gradient(180deg,
                        ${index % 2 === 0 ? "var(--simlak-orange)" : "var(--simlak-teal)"} 0%,
                        ${index % 2 === 0 ? "var(--simlak-coral)" : "var(--simlak-mint)"} 100%
                      )`,
                    }}
                  >
                    {/* Noise texture */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                      }}
                    />

                    {/* Flag */}
                    <div className="absolute top-6 left-6 text-7xl opacity-90 transform group-hover:scale-110 transition-transform duration-500">
                      {country.flagEmoji}
                    </div>

                    {/* Popular badge */}
                    <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      Popular
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 inset-x-0 p-6">
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        {country.name}
                      </h3>
                      <div className="flex items-center gap-3 text-white/80 text-sm mb-4">
                        <span>{country.packageCount} plans</span>
                        <span className="w-1 h-1 rounded-full bg-white/50" />
                        <span>Instant</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-white/60 text-sm">From</span>
                          <p className="text-2xl font-bold text-white">
                            {country.minPrice ? formatPrice(country.minPrice) : "$4.99"}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-45 transition-all duration-300">
                          <ArrowUpRight className="w-5 h-5 text-[var(--simlak-dark)]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-6 w-12 bg-gradient-to-r from-[var(--simlak-dark)] to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-6 w-12 bg-gradient-to-l from-[var(--simlak-dark)] to-transparent pointer-events-none" />
          </div>
        </section>
      )}

      {/* ============================================
          ALL COUNTRIES SECTION
          ============================================ */}
      <section className="py-20">
        <div className="container-wide">
          {/* Section header */}
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
              <div>
                <span className="text-[var(--simlak-teal)] text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">
                  Browse All
                </span>
                <h2 className="text-4xl md:text-5xl font-bold">
                  All <span className="text-[var(--simlak-orange)]">countries</span>
                </h2>
                <p className="text-muted-foreground mt-2">
                  {isLoading ? "Loading..." : `${displayCountries.length} destinations available`}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[var(--simlak-orange)]" />
                  Instant activation
                </span>
                <span className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-[var(--simlak-teal)]" />
                  Premium networks
                </span>
              </div>
            </div>
          </Reveal>

          {/* Region filters */}
          <Reveal delay={100}>
            <div className="flex flex-wrap items-center gap-3 mb-10 pb-8 border-b border-border">
              {regions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => setSelectedRegion(region.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedRegion === region.id
                      ? "bg-[var(--simlak-dark)] text-white shadow-lg"
                      : "bg-card text-muted-foreground border border-border hover:border-[var(--simlak-orange)] hover:text-foreground"
                  }`}
                >
                  {region.label}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Countries grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {isLoading ? (
              Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card rounded-2xl p-5 border border-border animate-pulse"
                >
                  <div className="w-12 h-12 rounded-lg bg-muted mb-4" />
                  <div className="h-5 w-3/4 bg-muted rounded mb-2" />
                  <div className="h-4 w-1/2 bg-muted rounded mb-3" />
                  <div className="h-6 w-1/3 bg-muted rounded" />
                </div>
              ))
            ) : displayCountries.length > 0 ? (
              displayCountries.map((country, index) => (
                <Link
                  key={country.code}
                  href={`/destinations/${country.code.toLowerCase()}`}
                  className="group"
                  style={{
                    animationDelay: `${Math.min(index * 20, 200)}ms`,
                  }}
                >
                  <div className="relative bg-card rounded-2xl p-5 border border-border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-[var(--simlak-orange)]/30 h-full">
                    {/* Popular badge */}
                    {country.popular && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 text-xs font-semibold bg-[var(--simlak-orange)]/10 text-[var(--simlak-orange)] rounded-full">
                          Popular
                        </span>
                      </div>
                    )}

                    {/* Flag */}
                    <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                      {country.flagEmoji}
                    </div>

                    {/* Name */}
                    <h3 className="font-bold text-lg mb-1 group-hover:text-[var(--simlak-orange)] transition-colors">
                      {country.name}
                    </h3>

                    {/* Package count */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--simlak-teal)]" />
                      <span>{country.packageCount || "Multiple"} plans</span>
                    </div>

                    {/* Price */}
                    {country.minPrice && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs text-muted-foreground">From</span>
                          <span className="text-lg font-bold text-[var(--simlak-orange)]">
                            {formatPrice(country.minPrice)}
                          </span>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-[var(--simlak-orange)] group-hover:text-white transition-all">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full">
                <div className="text-center py-20 px-6 bg-card rounded-3xl border border-border">
                  <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                    <MapPin className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">No destinations found</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    We couldn&apos;t find any destinations matching your search.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedRegion("all");
                    }}
                    className="bg-[var(--simlak-orange)] text-white font-bold px-8 py-4 rounded-full hover:shadow-xl transition-all"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results count */}
          {displayCountries.length > 0 && (
            <div className="text-center mt-12">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{displayCountries.length}</span> of{" "}
                {individualCountries.length} destinations
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          BUNDLES CTA
          ============================================ */}
      <section className="py-20 bg-card">
        <div className="container-wide">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--simlak-dark)] to-[#2a2a2a] p-10 md:p-16">
              {/* Background effects */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                  }}
                />
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--simlak-orange)] rounded-full blur-[150px] opacity-20" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--simlak-teal)] rounded-full blur-[150px] opacity-20" />

              <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
                <div className="text-white">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--simlak-orange)] flex items-center justify-center">
                      <Layers className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-[var(--simlak-orange)] font-semibold">Regional Bundles</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                    Visiting multiple countries?
                  </h2>
                  <p className="text-white/70 text-lg mb-8 leading-relaxed">
                    Save with our regional bundles. One eSIM covers multiple countries across Europe, Asia, and more.
                  </p>
                  <Link href="/bundles">
                    <button className="group bg-white text-[var(--simlak-dark)] font-bold text-lg px-10 py-5 rounded-full flex items-center gap-3 hover:shadow-2xl transition-all">
                      View Bundles
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>

                <div className="hidden md:flex justify-center">
                  <div className="grid grid-cols-3 gap-3">
                    {["🇫🇷", "🇩🇪", "🇮🇹", "🇪🇸", "🇳🇱", "🇧🇪", "🇦🇹", "🇨🇭", "🇵🇹"].map((flag, i) => (
                      <div
                        key={i}
                        className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl transform hover:scale-110 transition-transform"
                      >
                        {flag}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Hide scrollbar utility */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
